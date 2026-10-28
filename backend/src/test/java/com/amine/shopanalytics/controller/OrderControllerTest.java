package com.amine.shopanalytics.controller;

import com.amine.shopanalytics.dto.OrderRequest;
import com.amine.shopanalytics.model.Order;
import com.amine.shopanalytics.model.Product;
import com.amine.shopanalytics.repository.OrderRepository;
import com.amine.shopanalytics.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for OrderController, with both repositories mocked.
 * The key rule under test: the total price is computed on the server
 * from the current product price, never trusted from the client.
 */
class OrderControllerTest {

    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final OrderController controller =
            new OrderController(orderRepository, productRepository);

    private OrderRequest sampleRequest() {
        OrderRequest request = new OrderRequest();
        request.setProductId(1L);
        request.setQuantity(3);
        request.setCustomerEmail("buyer@example.com");
        return request;
    }

    @Test
    void createOrderComputesTotalFromProductPrice() {
        Product product = new Product("Mouse", "A mouse",
                new BigDecimal("10.00"), "Electronics", 50);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createOrder(sampleRequest());

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        Order saved = (Order) response.getBody();
        assertEquals(new BigDecimal("30.00"), saved.getTotalPrice());
        assertEquals("PENDING", saved.getStatus());
    }

    @Test
    void createOrderWithMissingProductReturns404() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        var response = controller.createOrder(sampleRequest());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateOrderStatusWithInvalidStatusReturns400() {
        var response = controller.updateOrderStatus(1L, "WRONG");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void updateOrderStatusToShippedReturns200() {
        Product product = new Product("Mouse", "A mouse",
                new BigDecimal("10.00"), "Electronics", 50);
        Order order = new Order(product, 1, new BigDecimal("10.00"),
                "buyer@example.com");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.updateOrderStatus(1L, "shipped");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("SHIPPED", ((Order) response.getBody()).getStatus());
    }
}
