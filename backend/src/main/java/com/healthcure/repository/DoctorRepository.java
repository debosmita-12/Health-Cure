package com.healthcure.repository;

import com.healthcure.model.Doctor;
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
public class DoctorRepository {

    private final JdbcTemplate jdbcTemplate;

    public DoctorRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Doctor> rowMapper = (rs, rowNum) -> {
        Doctor doc = new Doctor();
        doc.setId(rs.getLong("id"));
        doc.setUserId(rs.getLong("user_id"));
        try { doc.setDepartmentId(rs.getObject("department_id") != null ? rs.getLong("department_id") : null); } catch (Exception ignored) {}
        doc.setSpecialisation(rs.getString("specialisation"));
        doc.setLicenceNumber(rs.getString("licence_number"));
        doc.setQualification(rs.getString("qualification"));
        doc.setExperienceYears(rs.getInt("experience_years"));
        try { doc.setConsultationFee(rs.getDouble("consultation_fee")); } catch (Exception ignored) {}
        try { doc.setHospitalAffiliation(rs.getString("hospital_affiliation")); } catch (Exception ignored) {}
        try { doc.setBiography(rs.getString("biography")); } catch (Exception ignored) {}
        try { doc.setProfileImageUrl(rs.getString("profile_image_url")); } catch (Exception ignored) {}
        doc.setVerifiedByAdmin(rs.getBoolean("verified_by_admin"));
        Timestamp vat = rs.getTimestamp("verified_at");
        if (vat != null) doc.setVerifiedAt(vat.toLocalDateTime());
        return doc;
    };

    public Optional<Doctor> findById(Long id) {
        String sql = "SELECT * FROM doctors WHERE id = ?";
        List<Doctor> list = jdbcTemplate.query(sql, rowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Optional<Doctor> findByUserId(Long userId) {
        String sql = "SELECT * FROM doctors WHERE user_id = ?";
        List<Doctor> list = jdbcTemplate.query(sql, rowMapper, userId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<Doctor> findAllVerified() {
        String sql = "SELECT * FROM doctors WHERE verified_by_admin = true ORDER BY id ASC";
        return jdbcTemplate.query(sql, rowMapper);
    }

    public List<Doctor> findAll() {
        return jdbcTemplate.query("SELECT * FROM doctors ORDER BY id ASC", rowMapper);
    }

    public Doctor save(Doctor doctor) {
        if (doctor.getId() == null) {
            String sql = "INSERT INTO doctors (user_id, department_id, specialisation, licence_number, qualification, experience_years, consultation_fee, hospital_affiliation, biography, profile_image_url, verified_by_admin, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(sql, new String[] { "id" });
                ps.setLong(1, doctor.getUserId());
                if (doctor.getDepartmentId() != null) {
                    ps.setLong(2, doctor.getDepartmentId());
                } else {
                    ps.setNull(2, java.sql.Types.BIGINT);
                }
                ps.setString(3, doctor.getSpecialisation());
                ps.setString(4, doctor.getLicenceNumber());
                ps.setString(5, doctor.getQualification());
                ps.setInt(6, doctor.getExperienceYears() != null ? doctor.getExperienceYears() : 0);
                ps.setDouble(7, doctor.getConsultationFee() != null ? doctor.getConsultationFee() : 75.0);
                ps.setString(8, doctor.getHospitalAffiliation());
                ps.setString(9, doctor.getBiography());
                ps.setString(10, doctor.getProfileImageUrl());
                ps.setBoolean(11, doctor.getVerifiedByAdmin() != null ? doctor.getVerifiedByAdmin() : false);
                ps.setTimestamp(12, doctor.getVerifiedAt() != null ? Timestamp.valueOf(doctor.getVerifiedAt()) : null);
                return ps;
            }, keyHolder);
            if (keyHolder.getKey() != null) {
                doctor.setId(keyHolder.getKey().longValue());
            } else if (keyHolder.getKeys() != null && keyHolder.getKeys().get("id") != null) {
                doctor.setId(((Number) keyHolder.getKeys().get("id")).longValue());
            }
            return doctor;
        } else {
            String sql = "UPDATE doctors SET department_id = ?, specialisation = ?, licence_number = ?, qualification = ?, experience_years = ?, consultation_fee = ?, hospital_affiliation = ?, biography = ?, profile_image_url = ?, verified_by_admin = ?, verified_at = ? WHERE id = ?";
            jdbcTemplate.update(sql,
                    doctor.getDepartmentId(),
                    doctor.getSpecialisation(),
                    doctor.getLicenceNumber(),
                    doctor.getQualification(),
                    doctor.getExperienceYears(),
                    doctor.getConsultationFee() != null ? doctor.getConsultationFee() : 75.0,
                    doctor.getHospitalAffiliation(),
                    doctor.getBiography(),
                    doctor.getProfileImageUrl(),
                    doctor.getVerifiedByAdmin(),
                    doctor.getVerifiedAt() != null ? Timestamp.valueOf(doctor.getVerifiedAt()) : null,
                    doctor.getId());
            return doctor;
        }
    }
}
