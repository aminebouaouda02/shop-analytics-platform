package com.amine.shopanalytics.controller;

import com.amine.shopanalytics.dto.AuthResponse;
import com.amine.shopanalytics.dto.LoginRequest;
import com.amine.shopanalytics.dto.RegisterRequest;
import com.amine.shopanalytics.model.Role;
import com.amine.shopanalytics.model.User;
import com.amine.shopanalytics.repository.UserRepository;
import com.amine.shopanalytics.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

/**
 * Public authentication endpoints.
 *
 * <ul>
 *   <li>{@code POST /api/auth/register} — creates a user with a BCrypt-hashed
 *       password and returns a JWT.</li>
 *   <li>{@code POST /api/auth/login} — checks credentials and returns a JWT.</li>
 * </ul>
 *
 * Both endpoints are reachable without a token (see {@code SecurityConfig});
 * every other API endpoint requires a valid token.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Username already taken"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> maybeUser = userRepository.findByUsername(request.getUsername());
        if (maybeUser.isEmpty()
                || !passwordEncoder.matches(request.getPassword(), maybeUser.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
        return ResponseEntity.ok(toResponse(maybeUser.get()));
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(jwtService.generateToken(user), user.getUsername(), user.getRole().name());
    }
}
