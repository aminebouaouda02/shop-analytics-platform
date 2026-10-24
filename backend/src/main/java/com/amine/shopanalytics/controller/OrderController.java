package com.amine.shopanalytics.controller;

import com.amine.shopanalytics.dto.OrderRequest;
import com.amine.shopanalytics.model.Order;
import com.amine.shopanalytics.model.Product;
import com.amine.shopanalytics.repository.OrderRepository;
import com.amine.shopanalytics.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * CRUD endpoints for orders (Day 3: single-line orders — one product, one quantity).
 *
 * <ul>
 *   <li>{@code GET /api/orders[?status=…]} — list, optionally filtered by status</li>
 *   <li>{@code GET /api/orders/{id}} — one order, 404 if missing</li>
 *   <li>{@code POST /api/orders} — create: the product must exist; the total
 *       price is computed here from the current product price
 *       ({@code price × quantity}), never taken from the client</li>
 *   <li>{@code PUT /api/orders/{id}/status?status=…} — change the status
 *       (PENDING, CONFIRMED, SHIPPED, CANCELLED)</li>
 *   <li>{@code DELETE /api/orders/{id}} — delete, answers 204, 404 if missing</li>
 * </ul>
 *
 * All endpoints require a valid JWT (see {@code SecurityConfig}).
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Set<String> VALID_STATUSES =
            Set.of("PENDING", "CONFIRMED", "SHIPPED", "CANCELLED");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderController(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Order> listOrders(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return orderRepository.findByStatus(status.toUpperCase());
        }
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request) {
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found: " + request.getProductId()));
        }
        BigDecimal totalPrice = product.getPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));
        Order order = new Order(product, request.getQuantity(), totalPrice, request.getCustomerEmail());
        Order saved = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id,
                                              @RequestParam String status) {
        String newStatus = status.toUpperCase();
        if (!VALID_STATUSES.contains(newStatus)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status. Use one of: " + VALID_STATUSES));
        }
        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(newStatus);
                    return ResponseEntity.ok(orderRepository.save(order));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(order -> {
                    orderRepository.delete(order);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
