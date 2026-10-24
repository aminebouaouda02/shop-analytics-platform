package com.amine.shopanalytics.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Payload for {@code POST /api/orders}: which product, how many,
 * and who is ordering.
 * The total price is always computed on the server from the current
 * product price — a client must never be trusted to send its own total.
 */
public class OrderRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private Integer quantity;

    @NotBlank
    @Email
    private String customerEmail;

    public OrderRequest() {
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
}
