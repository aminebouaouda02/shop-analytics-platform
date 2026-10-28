package com.amine.shopanalytics.controller;

import com.amine.shopanalytics.dto.AuthResponse;
import com.amine.shopanalytics.dto.LoginRequest;
import com.amine.shopanalytics.dto.RegisterRequest;
import com.amine.shopanalytics.model.Role;
import com.amine.shopanalytics.model.User;
import com.amine.shopanalytics.repository.UserRepository;
import com.amine.shopanalytics.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AuthController, with the repository, password encoder
 * and JWT service mocked. Only the controller's decisions are checked:
 * conflicts on register, and rejection of wrong credentials on login.
 */
class AuthControllerTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JwtService jwtService = mock(JwtService.class);
    private final AuthController controller =
            new AuthController(userRepository, passwordEncoder, jwtService);

    @Test
    void registerWithTakenUsernameReturns409() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("amine");
        request.setEmail("amine@example.com");
        request.setPassword("secret123");
        when(userRepository.existsByUsername("amine")).thenReturn(true);

        var response = controller.register(request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    void registerNewUserReturns201WithToken() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("amine");
        request.setEmail("amine@example.com");
        request.setPassword("secret123");
        when(userRepository.existsByUsername("amine")).thenReturn(false);
        when(userRepository.existsByEmail("amine@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(jwtService.generateToken(any(User.class))).thenReturn("token-123");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        AuthResponse body = (AuthResponse) response.getBody();
        assertEquals("token-123", body.getToken());
        assertEquals("amine", body.getUsername());
        assertEquals(Role.ROLE_USER.name(), body.getRole());
    }

    @Test
    void loginWithWrongPasswordReturns401() {
        User user = new User();
        user.setUsername("amine");
        user.setPasswordHash("hashed");
        when(userRepository.findByUsername("amine")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        LoginRequest request = new LoginRequest();
        request.setUsername("amine");
        request.setPassword("wrong");

        var response = controller.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
