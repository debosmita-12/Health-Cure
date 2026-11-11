package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class DepartmentRepository {

    private final JdbcTemplate jdbcTemplate;

    public DepartmentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findAll() {
        return jdbcTemplate.queryForList("SELECT * FROM departments ORDER BY name ASC");
    }

    public void save(String name, String description, String headDoctorName) {
        String sql = "INSERT INTO departments (name, description, head_doctor_name, is_active) VALUES (?, ?, ?, true)";
        jdbcTemplate.update(sql, name, description, headDoctorName);
    }
}
