package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class DoctorScheduleRepository {

    private final JdbcTemplate jdbcTemplate;

    public DoctorScheduleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY id ASC";
        return jdbcTemplate.queryForList(sql, doctorId);
    }

    public void save(Long doctorId, String day, String start, String end, int slotMinutes) {
        String sql = "INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_minutes, is_active) VALUES (?, ?, ?, ?, ?, true)";
        jdbcTemplate.update(sql, doctorId, day, start, end, slotMinutes);
    }
}
