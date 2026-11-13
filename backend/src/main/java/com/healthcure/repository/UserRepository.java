package com.healthcure.repository;

import com.healthcure.model.User;
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
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<User> rowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setRole(rs.getString("role"));
        user.setFirstName(rs.getString("first_name"));
        user.setLastName(rs.getString("last_name"));
        user.setPhone(rs.getString("phone"));
        user.setIsActive(rs.getBoolean("is_active"));
        user.setIsVerified(rs.getBoolean("is_verified"));
        try {
            user.setProvider(rs.getString("provider"));
            user.setProviderId(rs.getString("provider_id"));
        } catch (Exception ignored) {}
        Timestamp cat = rs.getTimestamp("created_at");
        if (cat != null) user.setCreatedAt(cat.toLocalDateTime());
        Timestamp uat = rs.getTimestamp("updated_at");
        if (uat != null) user.setUpdatedAt(uat.toLocalDateTime());
        return user;
    };

    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        List<User> list = jdbcTemplate.query(sql, rowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        List<User> list = jdbcTemplate.query(sql, rowMapper, email);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Optional<User> findByProviderAndProviderId(String provider, String providerId) {
        String sql = "SELECT * FROM users WHERE provider = ? AND provider_id = ?";
        List<User> list = jdbcTemplate.query(sql, rowMapper, provider, providerId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public boolean existsByPhone(String phone) {
        if (phone == null || phone.isBlank()) return false;
        String sql = "SELECT COUNT(*) FROM users WHERE phone = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, phone.trim());
        return count != null && count > 0;
    }

    public boolean existsByNameAndRole(String firstName, String lastName, String role) {
        if (firstName == null || lastName == null) return false;
        String sql = "SELECT COUNT(*) FROM users WHERE LOWER(TRIM(first_name)) = LOWER(TRIM(?)) AND LOWER(TRIM(last_name)) = LOWER(TRIM(?)) AND UPPER(role) = UPPER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, firstName, lastName, role);
        return count != null && count > 0;
    }

    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);
    }

    public User save(User user) {
        if (user.getId() == null) {
            String sql = "INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified, provider, provider_id, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
            KeyHolder keyHolder = new GeneratedKeyHolder();

            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, new String[] { "id" });
                ps.setString(1, user.getEmail());
                ps.setString(2, user.getPasswordHash());
                ps.setString(3, user.getRole());
                ps.setString(4, user.getFirstName());
                ps.setString(5, user.getLastName());
                ps.setString(6, user.getPhone());
                ps.setBoolean(7, user.getIsActive() != null ? user.getIsActive() : true);
                ps.setBoolean(8, user.getIsVerified() != null ? user.getIsVerified() : false);
                ps.setString(9, user.getProvider() != null ? user.getProvider() : "LOCAL");
                ps.setString(10, user.getProviderId());
                return ps;
            }, keyHolder);

            if (keyHolder.getKey() != null) {
                user.setId(keyHolder.getKey().longValue());
            } else if (keyHolder.getKeys() != null && keyHolder.getKeys().get("id") != null) {
                user.setId(((Number) keyHolder.getKeys().get("id")).longValue());
            }
            return user;
        } else {
            String sql = "UPDATE users SET email = ?, role = ?, first_name = ?, last_name = ?, phone = ?, is_active = ?, is_verified = ?, provider = ?, provider_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            jdbcTemplate.update(sql, user.getEmail(), user.getRole(), user.getFirstName(), user.getLastName(), user.getPhone(), user.getIsActive(), user.getIsVerified(), user.getProvider(), user.getProviderId(), user.getId());
            return user;
        }
    }

    public List<User> findAll() {
        return jdbcTemplate.query("SELECT * FROM users ORDER BY id DESC", rowMapper);
    }
}
