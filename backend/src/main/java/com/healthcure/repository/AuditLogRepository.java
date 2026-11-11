package com.healthcure.repository;

import com.healthcure.model.AuditLog;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class AuditLogRepository {

    private final JdbcTemplate jdbcTemplate;

    public AuditLogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<AuditLog> rowMapper = (rs, rowNum) -> {
        AuditLog log = new AuditLog();
        log.setId(rs.getLong("id"));
        long uid = rs.getLong("user_id");
        if (!rs.wasNull()) log.setUserId(uid);
        log.setAction(rs.getString("action"));
        log.setEntityType(rs.getString("entity_type"));
        long eid = rs.getLong("entity_id");
        if (!rs.wasNull()) log.setEntityId(eid);
        log.setDetails(rs.getString("details"));
        log.setIpAddress(rs.getString("ip_address"));
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) log.setCreatedAt(ts.toLocalDateTime());
        return log;
    };

    public void log(Long userId, String action, String entityType, Long entityId, String details, String ipAddress) {
        String sql = "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        jdbcTemplate.update(sql, userId, action, entityType, entityId, details, ipAddress);
    }

    public List<AuditLog> findAll(int limit) {
        String sql = "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?";
        return jdbcTemplate.query(sql, rowMapper, limit);
    }
}
