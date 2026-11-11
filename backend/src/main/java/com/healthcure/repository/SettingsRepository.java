package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class SettingsRepository {

    private final JdbcTemplate jdbcTemplate;

    public SettingsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, String> getAll() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT setting_key, setting_value FROM system_settings");
        Map<String, String> map = new HashMap<>();
        for (Map<String, Object> r : rows) {
            map.put((String) r.get("setting_key"), (String) r.get("setting_value"));
        }
        return map;
    }

    public void set(String key, String value) {
        String sql = "MERGE INTO system_settings (setting_key, setting_value, updated_at) KEY(setting_key) VALUES (?, ?, CURRENT_TIMESTAMP)";
        jdbcTemplate.update(sql, key, value);
    }
}
