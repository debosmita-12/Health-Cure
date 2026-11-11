package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class VitalsRepository {

    private final JdbcTemplate jdbcTemplate;

    public VitalsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findByPatientId(Long patientId) {
        String sql = "SELECT * FROM vitals WHERE patient_id = ? ORDER BY recorded_at DESC";
        return jdbcTemplate.queryForList(sql, patientId);
    }

    public void save(Long patientId, String bp, Integer hr, Double temp, Integer rr, Integer o2, Double bmi, Double glucose) {
        String sql = "INSERT INTO vitals (patient_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, bmi, blood_glucose, recorded_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        jdbcTemplate.update(sql, patientId, bp, hr, temp, rr, o2, bmi, glucose);
    }
}
