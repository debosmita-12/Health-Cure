package com.healthcure.repository;

import com.healthcure.model.MedicalRecord;
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
public class RecordRepository {

    private final JdbcTemplate jdbcTemplate;

    public RecordRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<MedicalRecord> rowMapper = (rs, rowNum) -> {
        MedicalRecord rec = new MedicalRecord();
        rec.setId(rs.getLong("id"));
        rec.setPatientId(rs.getLong("patient_id"));
        long docId = rs.getLong("doctor_id");
        if (!rs.wasNull()) rec.setDoctorId(docId);
        rec.setRecordType(rs.getString("record_type"));
        rec.setTitle(rs.getString("title"));
        rec.setDescription(rs.getString("description"));
        rec.setFilePath(rs.getString("file_path"));
        rec.setFileType(rs.getString("file_type"));
        long size = rs.getLong("file_size");
        if (!rs.wasNull()) rec.setFileSize(size);
        Timestamp rdate = rs.getTimestamp("record_date");
        if (rdate != null) rec.setRecordDate(rdate.toLocalDateTime());
        Timestamp cdate = rs.getTimestamp("created_at");
        if (cdate != null) rec.setCreatedAt(cdate.toLocalDateTime());
        return rec;
    };

    public Optional<MedicalRecord> findById(Long id) {
        String sql = "SELECT * FROM medical_records WHERE id = ?";
        List<MedicalRecord> list = jdbcTemplate.query(sql, rowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<MedicalRecord> findByPatientId(Long patientId) {
        String sql = "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY record_date DESC";
        return jdbcTemplate.query(sql, rowMapper, patientId);
    }

    public MedicalRecord save(MedicalRecord record) {
        if (record.getId() == null) {
            String sql = "INSERT INTO medical_records (patient_id, doctor_id, record_type, title, description, file_path, file_type, file_size, record_date, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(sql, new String[] { "id" });
                ps.setLong(1, record.getPatientId());
                if (record.getDoctorId() != null) ps.setLong(2, record.getDoctorId());
                else ps.setNull(2, java.sql.Types.BIGINT);
                ps.setString(3, record.getRecordType());
                ps.setString(4, record.getTitle());
                ps.setString(5, record.getDescription());
                ps.setString(6, record.getFilePath());
                ps.setString(7, record.getFileType());
                if (record.getFileSize() != null) ps.setLong(8, record.getFileSize());
                else ps.setNull(8, java.sql.Types.BIGINT);
                return ps;
            }, keyHolder);
            if (keyHolder.getKey() != null) {
                record.setId(keyHolder.getKey().longValue());
            } else if (keyHolder.getKeys() != null && keyHolder.getKeys().get("id") != null) {
                record.setId(((Number) keyHolder.getKeys().get("id")).longValue());
            }
            return record;
        } else {
            String sql = "UPDATE medical_records SET title = ?, description = ?, file_path = ?, file_type = ?, file_size = ? WHERE id = ?";
            jdbcTemplate.update(sql, record.getTitle(), record.getDescription(), record.getFilePath(), record.getFileType(), record.getFileSize(), record.getId());
            return record;
        }
    }

    public void savePrescription(Long recordId, String medicineName, String dosage, String frequency, String duration, String notes) {
        String sql = "INSERT INTO prescriptions (record_id, medicine_name, dosage, frequency, duration, notes) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, recordId, medicineName, dosage, frequency, duration, notes);
    }

    public List<java.util.Map<String, Object>> findPrescriptionsByPatientId(Long patientId) {
        String sql = "SELECT p.id, p.record_id, p.medicine_name, p.dosage, p.frequency, p.duration, p.notes, " +
                     "mr.record_date, mr.doctor_id, doc_u.first_name AS doctor_first_name, doc_u.last_name AS doctor_last_name, " +
                     "d.specialisation AS doctor_specialisation " +
                     "FROM prescriptions p " +
                     "JOIN medical_records mr ON p.record_id = mr.id " +
                     "LEFT JOIN doctors d ON mr.doctor_id = d.id " +
                     "LEFT JOIN users doc_u ON d.user_id = doc_u.id " +
                     "WHERE mr.patient_id = ? ORDER BY mr.record_date DESC";
        return jdbcTemplate.queryForList(sql, patientId);
    }

    public void saveConsultation(Long recordId, String symptoms, String diagnosis, String treatmentPlan, String followUpNotes) {
        String sql = "INSERT INTO consultations (record_id, symptoms, diagnosis, treatment_plan, follow_up_notes) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, recordId, symptoms, diagnosis, treatmentPlan, followUpNotes);
    }

    public List<java.util.Map<String, Object>> findConsultationsByPatientId(Long patientId) {
        String sql = "SELECT c.id, c.record_id, c.symptoms, c.diagnosis, c.treatment_plan, c.follow_up_notes, " +
                     "mr.title, mr.description, mr.record_date, mr.doctor_id, " +
                     "doc_u.first_name AS doctor_first_name, doc_u.last_name AS doctor_last_name, " +
                     "d.specialisation AS doctor_specialisation " +
                     "FROM consultations c " +
                     "JOIN medical_records mr ON c.record_id = mr.id " +
                     "LEFT JOIN doctors d ON mr.doctor_id = d.id " +
                     "LEFT JOIN users doc_u ON d.user_id = doc_u.id " +
                     "WHERE mr.patient_id = ? ORDER BY mr.record_date DESC";
        return jdbcTemplate.queryForList(sql, patientId);
    }
}
