package com.healthcure.controller;

import com.healthcure.model.AccessRequest;
import com.healthcure.model.Doctor;
import com.healthcure.model.MedicalRecord;
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
@RequestMapping("/api/doctor")
public class DoctorController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final RecordRepository recordRepository;
    private final AppointmentRepository appointmentRepository;
    private final AccessRepository accessRepository;
    private final AuditLogRepository auditLogRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final LeaveRepository leaveRepository;
    private final FeedbackRepository feedbackRepository;

    public DoctorController(UserRepository userRepository,
                            DoctorRepository doctorRepository,
                            PatientRepository patientRepository,
                            RecordRepository recordRepository,
                            AppointmentRepository appointmentRepository,
                            AccessRepository accessRepository,
                            AuditLogRepository auditLogRepository,
                            DoctorScheduleRepository scheduleRepository,
                            LeaveRepository leaveRepository,
                            FeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.recordRepository = recordRepository;
        this.appointmentRepository = appointmentRepository;
        this.accessRepository = accessRepository;
        this.auditLogRepository = auditLogRepository;
        this.scheduleRepository = scheduleRepository;
        this.leaveRepository = leaveRepository;
        this.feedbackRepository = feedbackRepository;
    }

    private User getAuthenticatedUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Doctor getDoctor(User user) {
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Doctor profile not found"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = getDoctor(user);

        Map<String, Object> data = new HashMap<>();
        data.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole()
        ));
        data.put("doctor", doctor);
        data.put("appointments", appointmentRepository.findByDoctorId(doctor.getId()));
        data.put("accessRequests", accessRepository.findByDoctorId(doctor.getId()));
        data.put("schedules", scheduleRepository.findByDoctorId(doctor.getId()));
        data.put("leaves", leaveRepository.findByDoctorId(doctor.getId()));
        data.put("feedback", feedbackRepository.findByDoctorId(doctor.getId()));

        return ResponseEntity.ok(data);
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = getDoctor(user);
        return ResponseEntity.ok(appointmentRepository.findByDoctorId(doctor.getId()));
    }

    @PostMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = getDoctor(user);
        String status = body.getOrDefault("status", "COMPLETED");
        appointmentRepository.findById(id).ifPresent(appt -> {
            appt.setStatus(status);
            appointmentRepository.save(appt);
            auditLogRepository.log(user.getId(), "APPOINTMENT_UPDATED", "APPOINTMENT", id, "Doctor updated status to " + status, "127.0.0.1");
        });
        return ResponseEntity.ok(Map.of("message", "Appointment status updated to " + status));
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getAssignedPatients(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = getDoctor(user);
        // Returns list of patients with valid appointments or approved access requests
        return ResponseEntity.ok(appointmentRepository.findByDoctorId(doctor.getId()));
    }

    @PostMapping("/access/request")
    public ResponseEntity<?> requestAccess(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = getDoctor(user);

        Long patientId = Long.valueOf(body.get("patientId").toString());
        String reason = (String) body.getOrDefault("reason", "Pre-consultation clinical evaluation");

        AccessRequest req = new AccessRequest();
        req.setDoctorId(doctor.getId());
        req.setPatientId(patientId);
        req.setStatus("PENDING");
        req.setReason(reason);
        req.setRequestedAt(LocalDateTime.now());
        AccessRequest saved = accessRepository.save(req);

        auditLogRepository.log(user.getId(), "ACCESS_REQUEST_SUBMITTED", "PATIENT", patientId, "Doctor requested patient medical history access.", "127.0.0.1");

        return ResponseEntity.ok(Map.of("message", "Access request sent to patient.", "request", saved));
    }

    @PostMapping("/records/create")
    public ResponseEntity<?> createRecord(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = getDoctor(user);

        Long patientId = Long.valueOf(body.get("patientId").toString());

        // Verify patient relationship (consent or scheduled appointment) before writing records
        boolean hasConsent = accessRepository.hasActiveAccess(doctor.getId(), patientId);
        boolean hasAppointment = appointmentRepository.findByDoctorId(doctor.getId()).stream()
                .anyMatch(a -> a.getPatientId() != null && a.getPatientId().equals(patientId));
        if (!hasConsent && !hasAppointment) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: patient must have a scheduled appointment or active consent."));
        }

        MedicalRecord record = new MedicalRecord();
        record.setPatientId(patientId);
        record.setDoctorId(doctor.getId());
        record.setRecordType((String) body.getOrDefault("recordType", "CONSULTATION"));
        record.setTitle((String) body.getOrDefault("title", "Clinical Consultation Entry"));
        record.setDescription((String) body.getOrDefault("description", "Authored by attending physician"));
        record.setFileType("text/plain");

        MedicalRecord saved = recordRepository.save(record);

        // If consultation details provided, persist to consultations table
        if (body.containsKey("diagnosis") || body.containsKey("symptoms")) {
            String symptoms = (String) body.getOrDefault("symptoms", "");
            String diagnosis = (String) body.getOrDefault("diagnosis", "");
            String treatmentPlan = (String) body.getOrDefault("treatmentPlan", "");
            String followUpNotes = (String) body.getOrDefault("followUpNotes", "");
            recordRepository.saveConsultation(saved.getId(), symptoms, diagnosis, treatmentPlan, followUpNotes);
        }

        // If prescription details provided, persist to prescriptions table
        if (body.containsKey("medicineName")) {
            String med = (String) body.get("medicineName");
            String dosage = (String) body.getOrDefault("dosage", "1 tablet");
            String freq = (String) body.getOrDefault("frequency", "Once daily");
            String dur = (String) body.getOrDefault("duration", "7 days");
            String notes = (String) body.getOrDefault("notes", "After food");
            recordRepository.savePrescription(saved.getId(), med, dosage, freq, dur, notes);
        }

        auditLogRepository.log(user.getId(), "RECORD_CREATED", "MEDICAL_RECORD", saved.getId(), "Doctor authored clinical consultation entry.", "127.0.0.1");

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/prescriptions/create")
    public ResponseEntity<?> createPrescription(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = getDoctor(user);

        Long patientId = Long.valueOf(body.get("patientId").toString());
        boolean hasConsent = accessRepository.hasActiveAccess(doctor.getId(), patientId);
        boolean hasAppointment = appointmentRepository.findByDoctorId(doctor.getId()).stream()
                .anyMatch(a -> a.getPatientId() != null && a.getPatientId().equals(patientId));
        if (!hasConsent && !hasAppointment) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: patient must have a scheduled appointment or active consent."));
        }

        String medicineName = (String) body.get("medicineName");
        String dosage = (String) body.getOrDefault("dosage", "1 tablet");
        String frequency = (String) body.getOrDefault("frequency", "Once daily");
        String duration = (String) body.getOrDefault("duration", "7 days");
        String notes = (String) body.getOrDefault("notes", "Take as directed");

        MedicalRecord record = new MedicalRecord();
        record.setPatientId(patientId);
        record.setDoctorId(doctor.getId());
        record.setRecordType("PRESCRIPTION");
        record.setTitle("Prescription: " + medicineName);
        record.setDescription(dosage + ", " + frequency + " for " + duration + ". Notes: " + notes);
        record.setFileType("text/plain");
        MedicalRecord saved = recordRepository.save(record);

        recordRepository.savePrescription(saved.getId(), medicineName, dosage, frequency, duration, notes);

        auditLogRepository.log(user.getId(), "PRESCRIPTION_CREATED", "PRESCRIPTION", saved.getId(),
                "Doctor authored prescription for " + medicineName, "127.0.0.1");

        return ResponseEntity.ok(Map.of("message", "Prescription finalized and delivered to patient vault.", "recordId", saved.getId()));
    }

    @PostMapping("/leaves")
    public ResponseEntity<?> submitLeave(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = getDoctor(user);

        String leaveType = (String) body.getOrDefault("leaveType", "Personal Leave");
        LocalDate start = LocalDate.parse((String) body.get("startDate"));
        LocalDate end = LocalDate.parse((String) body.get("endDate"));
        String reason = (String) body.get("reason");

        leaveRepository.save(doctor.getId(), leaveType, start, end, reason);
        return ResponseEntity.ok(Map.of("message", "Leave application submitted to Superadmin."));
    }
}
