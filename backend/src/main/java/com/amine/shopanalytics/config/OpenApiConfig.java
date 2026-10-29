package com.amine.shopanalytics.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI metadata for the Shop Analytics API.
 *
 * <p>springdoc-openapi generates the specification from the controllers at
 * runtime, so this class only declares the API title, version and the JWT
 * bearer scheme that protected endpoints expect. The interactive docs are
 * served at {@code /swagger-ui.html} and the raw JSON at
 * {@code /v3/api-docs} once the backend is running.</p>
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Shop Analytics API",
                version = "1.0",
                description = "Products, orders, JWT authentication and Spark sales analytics "
                        + "for the Shop Analytics Platform."
        ),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Paste the token returned by POST /api/auth/login, "
                + "without the 'Bearer ' prefix — Swagger UI adds it."
)
public class OpenApiConfig {
}
