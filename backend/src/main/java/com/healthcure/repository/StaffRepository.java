package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class StaffRepository {

    private final JdbcTemplate jdbcTemplate;

    public StaffRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findAll() {
        String sql = "SELECT s.*, d.name AS department_name FROM staff s " +
                     "LEFT JOIN departments d ON s.department_id = d.id ORDER BY s.id DESC";
        return jdbcTemplate.queryForList(sql);
    }

    public void save(String employeeId, String name, String email, String roleGroup, Long deptId, String phone) {
        String sql = "INSERT INTO staff (employee_id, name, email, role_group, department_id, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, true)";
        jdbcTemplate.update(sql, employeeId, name, email, roleGroup, deptId, phone);
    }
}
