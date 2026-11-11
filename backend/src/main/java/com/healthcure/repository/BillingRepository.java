package com.healthcure.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class BillingRepository {

    private final JdbcTemplate jdbcTemplate;

    public BillingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> findByPatientId(Long patientId) {
        String sql = "SELECT * FROM invoices WHERE patient_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.queryForList(sql, patientId);
    }

    public List<Map<String, Object>> findAll() {
        String sql = "SELECT i.*, u.first_name, u.last_name, u.email FROM invoices i " +
                     "JOIN patients p ON i.patient_id = p.id " +
                     "JOIN users u ON p.user_id = u.id ORDER BY i.created_at DESC";
        return jdbcTemplate.queryForList(sql);
    }

    public void createInvoice(Long patientId, Long appointmentId, String invoiceNo, double amount, String status, String method, String description) {
        String sql = "INSERT INTO invoices (patient_id, appointment_id, invoice_number, amount, status, payment_method, description, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        jdbcTemplate.update(sql, patientId, appointmentId, invoiceNo, amount, status, method, description);
    }

    public void updateStatus(Long id, String status) {
        String sql = "UPDATE invoices SET status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, id);
    }
}
