package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class LabRepository {

    private final JdbcTemplate jdbcTemplate;

    public LabRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findAllTests() {
        return jdbcTemplate.queryForList("SELECT * FROM lab_tests WHERE is_available = true ORDER BY name ASC");
    }

    public void saveTest(String name, String category, double price, String description, String prep) {
        String sql = "INSERT INTO lab_tests (name, category, price, description, preparation_instructions, is_available) VALUES (?, ?, ?, ?, ?, true)";
        jdbcTemplate.update(sql, name, category, price, description, prep);
    }

    public List<Map<String, Object>> findRequestsByPatientId(Long patientId) {
        String sql = "SELECT r.*, t.name AS test_name, t.category, t.price FROM lab_requests r " +
                     "JOIN lab_tests t ON r.test_id = t.id WHERE r.patient_id = ? ORDER BY r.created_at DESC";
        return jdbcTemplate.queryForList(sql, patientId);
    }

    public List<Map<String, Object>> findAllRequests() {
        String sql = "SELECT r.*, t.name AS test_name, t.price, p.patient_name FROM lab_requests r " +
                     "JOIN lab_tests t ON r.test_id = t.id " +
                     "JOIN appointments p ON r.patient_id = p.patient_id " +
                     "ORDER BY r.created_at DESC";
        return jdbcTemplate.queryForList(sql);
    }

    public void bookRequest(Long patientId, Long testId) {
        String sql = "INSERT INTO lab_requests (patient_id, test_id, status, created_at) VALUES (?, ?, 'REQUESTED', CURRENT_TIMESTAMP)";
        jdbcTemplate.update(sql, patientId, testId);
    }
}
