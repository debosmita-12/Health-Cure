package com.healthcure.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class PublicDoctorController {

    private final JdbcTemplate jdbcTemplate;

    public PublicDoctorController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/public")
    public ResponseEntity<List<Map<String, Object>>> getPublicDoctors() {
        String sql = "SELECT d.id AS doctor_id, u.first_name, u.last_name, d.specialisation, " +
                     "d.qualification, d.experience_years, d.consultation_fee, d.is_available, " +
                     "dep.name AS department_name " +
                     "FROM doctors d " +
                     "JOIN users u ON d.user_id = u.id " +
                     "LEFT JOIN departments dep ON d.department_id = dep.id " +
                     "WHERE d.verified_by_admin = true " +
                     "ORDER BY d.experience_years DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }
}
