package com.healthcure.controller;

import com.healthcure.dto.AuthResponse;
import com.healthcure.dto.GoogleAuthRequest;
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

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        return ResponseEntity.ok(authService.forgotPassword(email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        return ResponseEntity.ok(authService.resetPassword(email, token, newPassword));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.authenticateGoogle(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify() {
        return ResponseEntity.ok(Map.of("status", "authenticated"));
    }
}
