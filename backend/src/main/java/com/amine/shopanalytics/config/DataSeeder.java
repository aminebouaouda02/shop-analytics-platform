package com.amine.shopanalytics.config;

import com.amine.shopanalytics.model.Order;
import com.amine.shopanalytics.model.Product;
import com.amine.shopanalytics.model.Role;
import com.amine.shopanalytics.model.User;
import com.amine.shopanalytics.repository.OrderRepository;
import com.amine.shopanalytics.repository.ProductRepository;
import com.amine.shopanalytics.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Demo seed data, off by default.
 *
 * <p>Start the backend with {@code SEED_ENABLED=true} (see
 * {@code application.yml}) and this runner fills only tables that are still
 * empty, so restarting a seeded database never duplicates rows. It creates
 * one local demo account ({@code demo} / the demo password documented in the
 * README), 8 products across 4 categories, and 5 orders with different
 * statuses — enough to click through the catalogue, the orders pages and the
 * dashboard without creating anything by hand first.</p>
 *
 * <p>The demo password is a local placeholder, not a real credential: it
 * defaults to {@code demo12345} and can be overridden with the
 * {@code DEMO_PASSWORD} environment variable. Never enable seeding against a
 * shared or production database.</p>
 */
@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final String demoPassword;

    public DataSeeder(UserRepository userRepository,
                      ProductRepository productRepository,
                      OrderRepository orderRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.seed.demo-password:demo12345}") String demoPassword) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.demoPassword = demoPassword;
    }

    @Override
    public void run(String... args) {
        seedDemoUser();
        List<Product> products = seedProducts();
        seedOrders(products);
    }

    private void seedDemoUser() {
        if (userRepository.findByUsername("demo").isPresent()) {
            return;
        }
        User demo = new User();
        demo.setUsername("demo");
        demo.setEmail("demo@example.com");
        demo.setPasswordHash(passwordEncoder.encode(demoPassword));
        demo.setRole(Role.ROLE_USER);
        userRepository.save(demo);
    }

    private List<Product> seedProducts() {
        if (productRepository.count() > 0) {
            return productRepository.findAll();
        }
        List<Product> products = List.of(
                new Product("Wireless Headphones", "Noise-cancelling over-ear headphones",
                        new BigDecimal("79.99"), "Electronics", 50),
                new Product("Mechanical Keyboard", "Hot-swappable mechanical keyboard",
                        new BigDecimal("129.99"), "Electronics", 30),
                new Product("Coffee Maker", "12-cup drip coffee maker",
                        new BigDecimal("59.99"), "Home", 40),
                new Product("Desk Lamp", "Adjustable LED desk lamp",
                        new BigDecimal("29.99"), "Home", 80),
                new Product("Running Shoes", "Lightweight road running shoes",
                        new BigDecimal("89.99"), "Sports", 25),
                new Product("Yoga Mat", "Non-slip 6mm yoga mat",
                        new BigDecimal("24.99"), "Sports", 100),
                new Product("Java Programming Book", "Practical guide to modern Java",
                        new BigDecimal("39.99"), "Books", 60),
                new Product("Notebook Set", "Pack of 3 dotted notebooks",
                        new BigDecimal("12.99"), "Books", 200)
        );
        return productRepository.saveAll(products);
    }

    private void seedOrders(List<Product> products) {
        if (orderRepository.count() > 0 || products.isEmpty()) {
            return;
        }
        // Totals are computed the same way OrderController does:
        // current product price x quantity, never taken from a client.
        Order first = new Order(products.get(0), 2,
                products.get(0).getPrice().multiply(BigDecimal.valueOf(2)),
                "demo@example.com");
        first.setStatus("CONFIRMED");
        Order second = new Order(products.get(2), 1,
                products.get(2).getPrice(), "demo@example.com");
        second.setStatus("SHIPPED");
        Order third = new Order(products.get(4), 1,
                products.get(4).getPrice(), "alice@example.com");
        third.setStatus("PENDING");
        Order fourth = new Order(products.get(6), 3,
                products.get(6).getPrice().multiply(BigDecimal.valueOf(3)),
                "bob@example.com");
        fourth.setStatus("CONFIRMED");
        Order fifth = new Order(products.get(1), 1,
                products.get(1).getPrice(), "demo@example.com");
        fifth.setStatus("CANCELLED");
        orderRepository.saveAll(List.of(first, second, third, fourth, fifth));
    }
}
