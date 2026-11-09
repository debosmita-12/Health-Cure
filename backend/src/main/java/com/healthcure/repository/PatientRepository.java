package com.healthcure.repository;

import com.healthcure.model.Patient;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class PatientRepository {

    private final JdbcTemplate jdbcTemplate;

    public PatientRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Patient> rowMapper = (rs, rowNum) -> {
        Patient patient = new Patient();
        patient.setId(rs.getLong("id"));
        patient.setUserId(rs.getLong("user_id"));
        Date dob = rs.getDate("date_of_birth");
        if (dob != null) patient.setDateOfBirth(dob.toLocalDate());
        patient.setGender(rs.getString("gender"));
        patient.setBloodGroup(rs.getString("blood_group"));
        patient.setAddress(rs.getString("address"));
        patient.setEmergencyContact(rs.getString("emergency_contact"));
        return patient;
    };

    public Optional<Patient> findById(Long id) {
        String sql = "SELECT * FROM patients WHERE id = ?";
        List<Patient> list = jdbcTemplate.query(sql, rowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Optional<Patient> findByUserId(Long userId) {
        String sql = "SELECT * FROM patients WHERE user_id = ?";
        List<Patient> list = jdbcTemplate.query(sql, rowMapper, userId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Patient save(Patient patient) {
        if (patient.getId() == null) {
            String sql = "INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(sql, new String[] { "id" });
                ps.setLong(1, patient.getUserId());
                ps.setDate(2, patient.getDateOfBirth() != null ? Date.valueOf(patient.getDateOfBirth()) : null);
                ps.setString(3, patient.getGender());
                ps.setString(4, patient.getBloodGroup());
                ps.setString(5, patient.getAddress());
                ps.setString(6, patient.getEmergencyContact());
                return ps;
            }, keyHolder);
            if (keyHolder.getKey() != null) {
                patient.setId(keyHolder.getKey().longValue());
            } else if (keyHolder.getKeys() != null && keyHolder.getKeys().get("id") != null) {
                patient.setId(((Number) keyHolder.getKeys().get("id")).longValue());
            }
            return patient;
        } else {
            String sql = "UPDATE patients SET date_of_birth = ?, gender = ?, blood_group = ?, address = ?, emergency_contact = ? WHERE id = ?";
            jdbcTemplate.update(sql,
                    patient.getDateOfBirth() != null ? Date.valueOf(patient.getDateOfBirth()) : null,
                    patient.getGender(),
                    patient.getBloodGroup(),
                    patient.getAddress(),
                    patient.getEmergencyContact(),
                    patient.getId());
            return patient;
        }
    }
}
