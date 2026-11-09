package com.healthcure.controller;

import com.healthcure.dto.AuthResponse;
import com.healthcure.dto.LoginRequest;
import com.healthcure.dto.RegisterRequest;
import com.healthcure.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(authService.authenticateGoogle(payload));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify() {
        return ResponseEntity.ok(Map.of("status", "authenticated"));
    }
}
