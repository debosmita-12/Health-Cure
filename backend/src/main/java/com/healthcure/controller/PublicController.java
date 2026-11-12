package com.healthcure.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final JdbcTemplate jdbcTemplate;

    public PublicController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();

        Integer doctorCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM doctors WHERE verified_by_admin = true", Integer.class);
        Integer patientCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM patients", Integer.class);
        Integer departmentCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM departments WHERE is_active = true", Integer.class);
        Integer completedAppts = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM appointments WHERE status IN ('COMPLETED', 'CONFIRMED')", Integer.class);

        stats.put("totalDoctors", doctorCount != null ? doctorCount : 0);
        stats.put("totalPatients", patientCount != null ? patientCount : 0);
        stats.put("totalDepartments", departmentCount != null ? departmentCount : 0);
        stats.put("completedAppointments", completedAppts != null ? completedAppts : 0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        String sql = "SELECT id, name, description, head_doctor_name, is_active FROM departments WHERE is_active = true ORDER BY name ASC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @GetMapping("/testimonials")
    public ResponseEntity<List<Map<String, Object>>> getTestimonials() {
        String sql = "SELECT f.id, f.rating, f.comment, f.created_at, " +
                     "u.first_name AS patient_first_name, " +
                     "doc_u.first_name AS doctor_first_name, doc_u.last_name AS doctor_last_name, " +
                     "d.specialisation AS doctor_specialisation " +
                     "FROM feedback_reviews f " +
                     "JOIN patients p ON f.patient_id = p.id " +
                     "JOIN users u ON p.user_id = u.id " +
                     "JOIN doctors d ON f.doctor_id = d.id " +
                     "JOIN users doc_u ON d.user_id = doc_u.id " +
                     "WHERE f.rating >= 4 " +
                     "ORDER BY f.created_at DESC LIMIT 6";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> submitContactEnquiry(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim();
        String phone = body.getOrDefault("phone", "").trim();
        String subject = body.getOrDefault("subject", "General Enquiry").trim();
        String message = body.getOrDefault("message", "").trim();

        if (name.isEmpty() || email.isEmpty() || message.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, and message are required fields."));
        }

        jdbcTemplate.update(
                "INSERT INTO contact_enquiries (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
                name, email, phone, subject, message
        );

        return ResponseEntity.ok(Map.of(
                "message", "Thank you, " + name + ". Your enquiry has been received. Our clinical coordination desk will respond within 2 hours.",
                "status", "RECEIVED"
        ));
    }
}
