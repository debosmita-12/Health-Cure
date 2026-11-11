package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public class LeaveRepository {

    private final JdbcTemplate jdbcTemplate;

    public LeaveRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM leave_requests WHERE doctor_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.queryForList(sql, doctorId);
    }

    public List<Map<String, Object>> findAll() {
        String sql = "SELECT l.*, d.specialisation, u.first_name, u.last_name FROM leave_requests l " +
                     "JOIN doctors d ON l.doctor_id = d.id " +
                     "JOIN users u ON d.user_id = u.id ORDER BY l.created_at DESC";
        return jdbcTemplate.queryForList(sql);
    }

    public void save(Long doctorId, String leaveType, LocalDate start, LocalDate end, String reason) {
        String sql = "INSERT INTO leave_requests (doctor_id, leave_type, start_date, end_date, reason, status, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, 'PENDING', CURRENT_TIMESTAMP)";
        jdbcTemplate.update(sql, doctorId, leaveType, start, end, reason);
    }
}
