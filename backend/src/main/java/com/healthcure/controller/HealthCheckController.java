package com.healthcure.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    private final JdbcTemplate jdbcTemplate;

    public HealthCheckController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        boolean dbOk = false;
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbOk = (result != null && result == 1);
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "platform", "Health & Cure",
                "database", dbOk ? "CONNECTED" : "DISCONNECTED",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
