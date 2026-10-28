package com.amine.shopanalytics.controller;

import com.amine.shopanalytics.dto.ProductRequest;
import com.amine.shopanalytics.model.Product;
import com.amine.shopanalytics.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ProductController, with the repository mocked.
 * No database is needed: the controller logic (status codes, filters,
 * 404 handling) is what is being checked here.
 */
class ProductControllerTest {

    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final ProductController controller = new ProductController(productRepository);

    private Product sampleProduct() {
        return new Product("Laptop", "A laptop", new BigDecimal("999.99"),
                "Electronics", 10);
    }

    private ProductRequest sampleRequest() {
        ProductRequest request = new ProductRequest();
        request.setName("Laptop");
        request.setDescription("A laptop");
        request.setPrice(new BigDecimal("999.99"));
        request.setCategory("Electronics");
        request.setStockQuantity(10);
        return request;
    }

    @Test
    void createProductReturns201WithSavedProduct() {
        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createProduct(sampleRequest());

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Laptop", response.getBody().getName());
        assertEquals(new BigDecimal("999.99"), response.getBody().getPrice());
    }

    @Test
    void getMissingProductReturns404() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        var response = controller.getProduct(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void listProductsFiltersByCategory() {
        Product product = sampleProduct();
        when(productRepository.findByCategory("Electronics"))
                .thenReturn(List.of(product));

        List<Product> result = controller.listProducts("Electronics");

        assertEquals(1, result.size());
        verify(productRepository).findByCategory("Electronics");
    }

    @Test
    void updateMissingProductReturns404() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        var response = controller.updateProduct(99L, sampleRequest());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteExistingProductReturns204() {
        Product product = sampleProduct();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        var response = controller.deleteProduct(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(productRepository).delete(product);
    }
}
