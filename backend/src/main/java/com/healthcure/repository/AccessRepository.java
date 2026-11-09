package com.healthcure.repository;

import com.healthcure.model.AccessRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class AccessRepository {

    private final JdbcTemplate jdbcTemplate;

    public AccessRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<AccessRequest> rowMapper = (rs, rowNum) -> {
        AccessRequest req = new AccessRequest();
        req.setId(rs.getLong("id"));
        req.setDoctorId(rs.getLong("doctor_id"));
        req.setPatientId(rs.getLong("patient_id"));
        req.setStatus(rs.getString("status"));
        req.setReason(rs.getString("reason"));
        Timestamp reqAt = rs.getTimestamp("requested_at");
        if (reqAt != null) req.setRequestedAt(reqAt.toLocalDateTime());
        Timestamp respAt = rs.getTimestamp("responded_at");
        if (respAt != null) req.setRespondedAt(respAt.toLocalDateTime());
        Timestamp expAt = rs.getTimestamp("expires_at");
        if (expAt != null) req.setExpiresAt(expAt.toLocalDateTime());
        return req;
    };

    public Optional<AccessRequest> findById(Long id) {
        String sql = "SELECT * FROM access_requests WHERE id = ?";
        List<AccessRequest> list = jdbcTemplate.query(sql, rowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<AccessRequest> findByPatientId(Long patientId) {
        String sql = "SELECT * FROM access_requests WHERE patient_id = ? ORDER BY requested_at DESC";
        return jdbcTemplate.query(sql, rowMapper, patientId);
    }

    public List<AccessRequest> findByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM access_requests WHERE doctor_id = ? ORDER BY requested_at DESC";
        return jdbcTemplate.query(sql, rowMapper, doctorId);
    }

    public boolean hasActiveAccess(Long doctorId, Long patientId) {
        String sql = "SELECT COUNT(*) FROM access_requests WHERE doctor_id = ? AND patient_id = ? AND status = 'APPROVED' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, doctorId, patientId);
        return count != null && count > 0;
    }

    public AccessRequest save(AccessRequest request) {
        if (request.getId() == null) {
            String sql = "INSERT INTO access_requests (doctor_id, patient_id, status, reason, requested_at, responded_at, expires_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(sql, new String[] { "id" });
                ps.setLong(1, request.getDoctorId());
                ps.setLong(2, request.getPatientId());
                ps.setString(3, request.getStatus() != null ? request.getStatus() : "PENDING");
                ps.setString(4, request.getReason());
                ps.setTimestamp(5, request.getRespondedAt() != null ? Timestamp.valueOf(request.getRespondedAt()) : null);
                ps.setTimestamp(6, request.getExpiresAt() != null ? Timestamp.valueOf(request.getExpiresAt()) : null);
                return ps;
            }, keyHolder);
            if (keyHolder.getKey() != null) {
                request.setId(keyHolder.getKey().longValue());
            } else if (keyHolder.getKeys() != null && keyHolder.getKeys().get("id") != null) {
                request.setId(((Number) keyHolder.getKeys().get("id")).longValue());
            }
            return request;
        } else {
            String sql = "UPDATE access_requests SET status = ?, responded_at = ?, expires_at = ? WHERE id = ?";
            jdbcTemplate.update(sql,
                    request.getStatus(),
                    request.getRespondedAt() != null ? Timestamp.valueOf(request.getRespondedAt()) : null,
                    request.getExpiresAt() != null ? Timestamp.valueOf(request.getExpiresAt()) : null,
                    request.getId());
            return request;
        }
    }
}
