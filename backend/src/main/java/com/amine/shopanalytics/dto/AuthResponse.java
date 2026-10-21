package com.amine.shopanalytics.dto;

/**
 * Returned by {@code /api/auth/register} and {@code /api/auth/login}.
 * The frontend stores {@code token} and sends it as
 * {@code Authorization: Bearer <token>} on protected requests.
 */
public class AuthResponse {

    private final String token;
    private final String username;
    private final String role;

    public AuthResponse(String token, String username, String role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
}
