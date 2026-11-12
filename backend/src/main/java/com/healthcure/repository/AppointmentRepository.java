package com.healthcure.repository;

import com.healthcure.model.Appointment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

@Repository
public class AppointmentRepository {

    private final JdbcTemplate jdbcTemplate;

    public AppointmentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Appointment> rowMapper = (rs, rowNum) -> {
        Appointment appt = new Appointment();
        appt.setId(rs.getLong("id"));
        long pId = rs.getLong("patient_id");
        if (!rs.wasNull()) appt.setPatientId(pId);
        long dId = rs.getLong("doctor_id");
        if (!rs.wasNull()) appt.setDoctorId(dId);
        appt.setPatientName(rs.getString("patient_name"));
        appt.setPatientEmail(rs.getString("patient_email"));
        appt.setPatientPhone(rs.getString("patient_phone"));
        appt.setSpecialty(rs.getString("specialty"));
        appt.setConsultationType(rs.getString("consultation_type"));
        appt.setTimeSlot(rs.getString("time_slot"));
        appt.setPreferredDoctor(rs.getString("preferred_doctor"));
        Timestamp at = rs.getTimestamp("appointment_date");
        if (at != null) appt.setAppointmentDate(at.toLocalDateTime());
        appt.setStatus(rs.getString("status"));
        appt.setNotes(rs.getString("notes"));
        appt.setGoogleAuthenticated(rs.getBoolean("google_authenticated"));
        appt.setReferenceCode(rs.getString("reference_code"));
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) appt.setCreatedAt(ct.toLocalDateTime());

        try { appt.setDiagnosisTitle(rs.getString("diagnosis_title")); } catch (Exception ignored) {}
        try { appt.setClinicalNotes(rs.getString("clinical_notes")); } catch (Exception ignored) {}
        try { appt.setPrescriptions(rs.getString("prescriptions")); } catch (Exception ignored) {}
        try { appt.setFollowUpNotes(rs.getString("follow_up_notes")); } catch (Exception ignored) {}
        try {
            Timestamp dt = rs.getTimestamp("diagnosis_published_at");
            if (dt != null) appt.setDiagnosisPublishedAt(dt.toLocalDateTime());
        } catch (Exception ignored) {}
        try { appt.setPatientGender(rs.getString("patient_gender")); } catch (Exception ignored) {}
        try { appt.setPatientBloodGroup(rs.getString("patient_blood_group")); } catch (Exception ignored) {}
        try { appt.setPatientDob(rs.getString("patient_dob")); } catch (Exception ignored) {}
        try { appt.setPatientAddress(rs.getString("patient_address")); } catch (Exception ignored) {}
        try { appt.setEmergencyContact(rs.getString("emergency_contact")); } catch (Exception ignored) {}

        return appt;
    };

    public Optional<Appointment> findById(Long id) {
        String sql = "SELECT * FROM appointments WHERE id = ?";
        List<Appointment> list = jdbcTemplate.query(sql, rowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public Optional<Appointment> findByReferenceCode(String code) {
        String sql = "SELECT * FROM appointments WHERE reference_code = ?";
        List<Appointment> list = jdbcTemplate.query(sql, rowMapper, code);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<Appointment> findByPatientEmail(String email) {
        String sql = "SELECT * FROM appointments WHERE patient_email = ? ORDER BY appointment_date ASC";
        return jdbcTemplate.query(sql, rowMapper, email);
    }

    public List<Appointment> findByPatientId(Long patientId) {
        String sql = "SELECT * FROM appointments WHERE patient_id = ? ORDER BY appointment_date ASC";
        return jdbcTemplate.query(sql, rowMapper, patientId);
    }

    public List<Appointment> findByDoctorId(Long doctorId) {
        String sql = "SELECT * FROM appointments WHERE doctor_id = ? ORDER BY appointment_date ASC";
        return jdbcTemplate.query(sql, rowMapper, doctorId);
    }

    public List<Appointment> findAll() {
        String sql = "SELECT * FROM appointments ORDER BY appointment_date DESC";
        return jdbcTemplate.query(sql, rowMapper);
    }

    public boolean hasActiveAppointmentInDepartment(Long patientId, String email, String specialty) {
        if (specialty == null || specialty.isBlank()) return false;
        String sql = "SELECT COUNT(*) FROM appointments " +
                "WHERE (patient_id = ? OR (patient_email IS NOT NULL AND LOWER(patient_email) = LOWER(?))) " +
                "  AND LOWER(specialty) = LOWER(?) " +
                "  AND status NOT IN ('CANCELLED', 'COMPLETED', 'ATTENDED', 'NOT_ATTENDED')";
        Long pId = patientId != null ? patientId : -1L;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, pId, email != null ? email.trim() : "", specialty.trim());
        return count != null && count > 0;
    }

    public Appointment save(Appointment appt) {
        if (appt.getId() == null) {
            String sql = "INSERT INTO appointments (patient_id, doctor_id, patient_name, patient_email, patient_phone, specialty, consultation_type, time_slot, preferred_doctor, appointment_date, status, notes, google_authenticated, reference_code, diagnosis_title, clinical_notes, prescriptions, follow_up_notes, diagnosis_published_at, patient_gender, patient_blood_group, patient_dob, patient_address, emergency_contact, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(sql, new String[] { "id" });
                if (appt.getPatientId() != null) ps.setLong(1, appt.getPatientId());
                else ps.setNull(1, Types.BIGINT);
                if (appt.getDoctorId() != null) ps.setLong(2, appt.getDoctorId());
                else ps.setNull(2, Types.BIGINT);
                ps.setString(3, appt.getPatientName() != null ? appt.getPatientName() : "Patient");
                ps.setString(4, appt.getPatientEmail() != null ? appt.getPatientEmail() : "patient@healthcure.local");
                ps.setString(5, appt.getPatientPhone() != null ? appt.getPatientPhone() : "");
                ps.setString(6, appt.getSpecialty());
                ps.setString(7, appt.getConsultationType());
                ps.setString(8, appt.getTimeSlot());
                ps.setString(9, appt.getPreferredDoctor());
                ps.setTimestamp(10, appt.getAppointmentDate() != null ? Timestamp.valueOf(appt.getAppointmentDate()) : new Timestamp(System.currentTimeMillis()));
                ps.setString(11, appt.getStatus() != null ? appt.getStatus() : "REQUESTED");
                ps.setString(12, appt.getNotes());
                ps.setBoolean(13, appt.getGoogleAuthenticated() != null ? appt.getGoogleAuthenticated() : false);
                ps.setString(14, appt.getReferenceCode());
                ps.setString(15, appt.getDiagnosisTitle());
                ps.setString(16, appt.getClinicalNotes());
                ps.setString(17, appt.getPrescriptions());
                ps.setString(18, appt.getFollowUpNotes());
                ps.setTimestamp(19, appt.getDiagnosisPublishedAt() != null ? Timestamp.valueOf(appt.getDiagnosisPublishedAt()) : null);
                ps.setString(20, appt.getPatientGender());
                ps.setString(21, appt.getPatientBloodGroup());
                ps.setString(22, appt.getPatientDob());
                ps.setString(23, appt.getPatientAddress());
                ps.setString(24, appt.getEmergencyContact());
                return ps;
            }, keyHolder);
            if (keyHolder.getKey() != null) {
                appt.setId(keyHolder.getKey().longValue());
            } else if (keyHolder.getKeys() != null && keyHolder.getKeys().get("id") != null) {
                appt.setId(((Number) keyHolder.getKeys().get("id")).longValue());
            }
            return appt;
        } else {
            String sql = "UPDATE appointments SET appointment_date = ?, status = ?, notes = ?, " +
                    "diagnosis_title = ?, clinical_notes = ?, prescriptions = ?, follow_up_notes = ?, " +
                    "diagnosis_published_at = ?, patient_gender = ?, patient_blood_group = ?, " +
                    "patient_dob = ?, patient_address = ?, emergency_contact = ? WHERE id = ?";
            jdbcTemplate.update(sql,
                    Timestamp.valueOf(appt.getAppointmentDate()),
                    appt.getStatus(),
                    appt.getNotes(),
                    appt.getDiagnosisTitle(),
                    appt.getClinicalNotes(),
                    appt.getPrescriptions(),
                    appt.getFollowUpNotes(),
                    appt.getDiagnosisPublishedAt() != null ? Timestamp.valueOf(appt.getDiagnosisPublishedAt()) : null,
                    appt.getPatientGender(),
                    appt.getPatientBloodGroup(),
                    appt.getPatientDob(),
                    appt.getPatientAddress(),
                    appt.getEmergencyContact(),
                    appt.getId());
            return appt;
        }
    }
}
