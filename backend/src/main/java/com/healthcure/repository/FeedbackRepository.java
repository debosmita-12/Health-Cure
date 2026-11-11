package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class FeedbackRepository {

    private final JdbcTemplate jdbcTemplate;

    public FeedbackRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findByDoctorId(Long doctorId) {
        String sql = "SELECT f.*, u.first_name, u.last_name FROM feedback_reviews f " +
                     "JOIN patients p ON f.patient_id = p.id " +
                     "JOIN users u ON p.user_id = u.id WHERE f.doctor_id = ? ORDER BY f.created_at DESC";
        return jdbcTemplate.queryForList(sql, doctorId);
    }

    public List<Map<String, Object>> findAll() {
        String sql = "SELECT f.*, p_user.first_name AS patient_first, p_user.last_name AS patient_last, " +
                     "d_user.first_name AS doc_first, d_user.last_name AS doc_last, d.specialisation " +
                     "FROM feedback_reviews f " +
                     "JOIN patients p ON f.patient_id = p.id " +
                     "JOIN users p_user ON p.user_id = p_user.id " +
                     "JOIN doctors d ON f.doctor_id = d.id " +
                     "JOIN users d_user ON d.user_id = d_user.id ORDER BY f.created_at DESC";
        return jdbcTemplate.queryForList(sql);
    }

    public void save(Long patientId, Long doctorId, int rating, String comment) {
        String sql = "INSERT INTO feedback_reviews (patient_id, doctor_id, rating, comment, created_at) " +
                     "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";
        jdbcTemplate.update(sql, patientId, doctorId, rating, comment);
    }
}
