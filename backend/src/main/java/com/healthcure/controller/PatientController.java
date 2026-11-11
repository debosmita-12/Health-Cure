package com.healthcure.controller;

import com.healthcure.model.AccessRequest;
import com.healthcure.model.Patient;
import com.healthcure.model.User;
import com.healthcure.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final RecordRepository recordRepository;
    private final AppointmentRepository appointmentRepository;
    private final AccessRepository accessRepository;
    private final AuditLogRepository auditLogRepository;
    private final VitalsRepository vitalsRepository;
    private final LabRepository labRepository;
    private final BillingRepository billingRepository;
    private final FeedbackRepository feedbackRepository;

    public PatientController(UserRepository userRepository,
                             PatientRepository patientRepository,
                             RecordRepository recordRepository,
                             AppointmentRepository appointmentRepository,
                             AccessRepository accessRepository,
                             AuditLogRepository auditLogRepository,
                             VitalsRepository vitalsRepository,
                             LabRepository labRepository,
                             BillingRepository billingRepository,
                             FeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.recordRepository = recordRepository;
        this.appointmentRepository = appointmentRepository;
        this.accessRepository = accessRepository;
        this.auditLogRepository = auditLogRepository;
        this.vitalsRepository = vitalsRepository;
        this.labRepository = labRepository;
        this.billingRepository = billingRepository;
        this.feedbackRepository = feedbackRepository;
    }

    private User getAuthenticatedUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Patient getOrCreatePatient(User user) {
        return patientRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setUserId(user.getId());
                    return patientRepository.save(p);
                });
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);

        Map<String, Object> data = new HashMap<>();
        data.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole()
        ));
        data.put("patient", patient);
        data.put("records", recordRepository.findByPatientId(patient.getId()));
        data.put("appointments", appointmentRepository.findByPatientId(patient.getId()));
        data.put("accessRequests", accessRepository.findByPatientId(patient.getId()));
        data.put("vitals", vitalsRepository.findByPatientId(patient.getId()));
        data.put("invoices", billingRepository.findByPatientId(patient.getId()));
        data.put("labRequests", labRepository.findRequestsByPatientId(patient.getId()));

        return ResponseEntity.ok(data);
    }

    @GetMapping("/records")
    public ResponseEntity<?> getRecords(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);
        return ResponseEntity.ok(recordRepository.findByPatientId(patient.getId()));
    }

    @GetMapping("/vitals")
    public ResponseEntity<?> getVitals(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);
        return ResponseEntity.ok(vitalsRepository.findByPatientId(patient.getId()));
    }

    @PostMapping("/vitals")
    public ResponseEntity<?> recordVitals(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);

        String bp = (String) body.get("bloodPressure");
        Integer hr = body.get("heartRate") != null ? Integer.valueOf(body.get("heartRate").toString()) : null;
        Double temp = body.get("temperature") != null ? Double.valueOf(body.get("temperature").toString()) : null;
        Integer rr = body.get("respiratoryRate") != null ? Integer.valueOf(body.get("respiratoryRate").toString()) : null;
        Integer o2 = body.get("oxygenSaturation") != null ? Integer.valueOf(body.get("oxygenSaturation").toString()) : null;
        Double bmi = body.get("bmi") != null ? Double.valueOf(body.get("bmi").toString()) : null;
        Double glucose = body.get("bloodGlucose") != null ? Double.valueOf(body.get("bloodGlucose").toString()) : null;

        vitalsRepository.save(patient.getId(), bp, hr, temp, rr, o2, bmi, glucose);
        return ResponseEntity.ok(Map.of("message", "Vitals successfully recorded."));
    }

    @GetMapping("/lab-tests")
    public ResponseEntity<?> getLabTests() {
        return ResponseEntity.ok(labRepository.findAllTests());
    }

    @PostMapping("/lab-tests/book")
    public ResponseEntity<?> bookLabTest(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);
        Long testId = Long.valueOf(body.get("testId").toString());
        labRepository.bookRequest(patient.getId(), testId);
        return ResponseEntity.ok(Map.of("message", "Diagnostic test request booked successfully."));
    }

    @GetMapping("/invoices")
    public ResponseEntity<?> getInvoices(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);
        return ResponseEntity.ok(billingRepository.findByPatientId(patient.getId()));
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);
        Long doctorId = Long.valueOf(body.get("doctorId").toString());
        int rating = Integer.parseInt(body.get("rating").toString());
        String comment = (String) body.get("comment");
        feedbackRepository.save(patient.getId(), doctorId, rating, comment);
        return ResponseEntity.ok(Map.of("message", "Feedback recorded successfully."));
    }

    @PostMapping("/consent/approve")
    public ResponseEntity<?> approveConsent(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Long requestId = Long.valueOf(body.get("requestId").toString());
        AccessRequest req = accessRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Access request not found"));

        req.setStatus("APPROVED");
        req.setRespondedAt(LocalDateTime.now());
        req.setExpiresAt(LocalDateTime.now().plusDays(7));
        accessRepository.save(req);

        auditLogRepository.log(user.getId(), "CONSENT_APPROVED", "ACCESS_REQUEST", req.getId(), "Patient approved doctor access for 7 days.", "127.0.0.1");

        return ResponseEntity.ok(Map.of("message", "Access successfully granted for 7 days.", "status", "APPROVED"));
    }

    @PostMapping("/consent/revoke")
    public ResponseEntity<?> revokeConsent(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Long requestId = Long.valueOf(body.get("requestId").toString());
        AccessRequest req = accessRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Access request not found"));

        req.setStatus("REVOKED");
        req.setRespondedAt(LocalDateTime.now());
        accessRepository.save(req);

        auditLogRepository.log(user.getId(), "CONSENT_REVOKED", "ACCESS_REQUEST", req.getId(), "Patient revoked doctor access immediately.", "127.0.0.1");

        return ResponseEntity.ok(Map.of("message", "Doctor access revoked immediately.", "status", "REVOKED"));
    }

    @PostMapping("/invoices/{id}/pay")
    public ResponseEntity<?> payInvoice(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        billingRepository.updateStatus(id, "PAID");
        auditLogRepository.log(user.getId(), "INVOICE_PAID", "BILLING", id, "Patient settled invoice payment.", "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Payment processed successfully. Receipt generated."));
    }

    @PostMapping("/records/upload")
    public ResponseEntity<?> uploadRecord(@RequestBody Map<String, String> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);

        com.healthcure.model.MedicalRecord record = new com.healthcure.model.MedicalRecord();
        record.setPatientId(patient.getId());
        record.setTitle(body.getOrDefault("title", "Patient Health Upload"));
        record.setDescription(body.getOrDefault("description", "Uploaded by patient"));
        String rType = body.getOrDefault("recordType", "DOCUMENT");
        if ("LAB_REPORT".equalsIgnoreCase(rType)) {
            rType = "REPORT";
        }
        record.setRecordType(rType);
        record.setFileType("application/pdf");

        com.healthcure.model.MedicalRecord saved = recordRepository.save(record);
        auditLogRepository.log(user.getId(), "RECORD_UPLOADED", "MEDICAL_RECORD", saved.getId(), "Patient uploaded personal medical record.", "127.0.0.1");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = getOrCreatePatient(user);

        if (body.containsKey("gender")) patient.setGender((String) body.get("gender"));
        if (body.containsKey("bloodGroup")) patient.setBloodGroup((String) body.get("bloodGroup"));
        if (body.containsKey("emergencyContact")) patient.setEmergencyContact((String) body.get("emergencyContact"));
        if (body.containsKey("address")) patient.setAddress((String) body.get("address"));
        if (body.containsKey("dateOfBirth") && body.get("dateOfBirth") != null) {
            try {
                patient.setDateOfBirth(LocalDate.parse((String) body.get("dateOfBirth")));
            } catch (Exception ignored) {}
        }

        patientRepository.save(patient);
        auditLogRepository.log(user.getId(), "PATIENT_PROFILE_UPDATED", "PATIENT", patient.getId(), "Patient updated personal profile data.", "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully.", "patient", patient));
    }
}
