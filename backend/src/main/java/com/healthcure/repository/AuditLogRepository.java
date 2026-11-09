package com.healthcure.repository;

import com.healthcure.model.AuditLog;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AuditLogRepository {

    private final JdbcTemplate jdbcTemplate;

    public AuditLogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void log(Long userId, String action, String entityType, Long entityId, String details, String ipAddress) {
        String sql = "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        jdbcTemplate.update(sql, userId, action, entityType, entityId, details, ipAddress);
    }
}
