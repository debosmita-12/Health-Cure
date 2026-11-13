package com.healthcure.controller;

import com.healthcure.model.Doctor;
import com.healthcure.model.Patient;
import com.healthcure.model.User;
import com.healthcure.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final DepartmentRepository departmentRepository;
    private final StaffRepository staffRepository;
    private final BillingRepository billingRepository;
    private final LabRepository labRepository;
    private final SettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public AdminController(UserRepository userRepository,
                           DoctorRepository doctorRepository,
                           PatientRepository patientRepository,
                           AppointmentRepository appointmentRepository,
                           AuditLogRepository auditLogRepository,
                           DepartmentRepository departmentRepository,
                           StaffRepository staffRepository,
                           BillingRepository billingRepository,
                           LabRepository labRepository,
                           SettingsRepository settingsRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.departmentRepository = departmentRepository;
        this.staffRepository = staffRepository;
        this.billingRepository = billingRepository;
        this.labRepository = labRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    private User getAuthenticatedUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private List<Map<String, Object>> getAllDoctorsEnriched() {
        String sql = "SELECT d.id, d.user_id, u.first_name, u.last_name, u.email, u.phone, " +
                "d.specialisation, d.licence_number, d.qualification, d.experience_years, " +
                "d.consultation_fee, d.hospital_affiliation, d.biography, d.profile_image_url, " +
                "d.verified_by_admin, d.verified_at, d.is_available, dept.name as department_name, " +
                "u.is_active " +
                "FROM doctors d JOIN users u ON d.user_id = u.id " +
                "LEFT JOIN departments dept ON d.department_id = dept.id " +
                "ORDER BY d.id ASC";
        return jdbcTemplate.queryForList(sql);
    }

    private List<Map<String, Object>> getAllPatientsEnriched() {
        String sql = "SELECT p.id, p.user_id, u.first_name, u.last_name, u.email, u.phone, " +
                "p.gender, p.blood_group, p.date_of_birth, p.address, p.emergency_contact, " +
                "u.is_active, u.created_at, " +
                "(SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id OR (a.patient_email IS NOT NULL AND LOWER(a.patient_email) = LOWER(u.email))) as total_appointments " +
                "FROM patients p JOIN users u ON p.user_id = u.id ORDER BY p.id DESC";
        return jdbcTemplate.queryForList(sql);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        User user = getAuthenticatedUser(auth);

        Map<String, Object> data = new HashMap<>();
        data.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "role", user.getRole()
        ));
        data.put("doctors", getAllDoctorsEnriched());
        data.put("patients", getAllPatientsEnriched());
        data.put("appointments", appointmentRepository.findAll());
        data.put("auditLogs", auditLogRepository.findAll(40));
        data.put("departments", departmentRepository.findAll());
        data.put("staff", staffRepository.findAll());
        data.put("billing", billingRepository.findAll());
        data.put("labTests", labRepository.findAllTests());
        data.put("settings", settingsRepository.getAll());

        return ResponseEntity.ok(data);
    }

    // ==========================================
    // DOCTOR MANAGEMENT (ROSTER, MAINTAIN, DELETE)
    // ==========================================

    @GetMapping("/doctors")
    public ResponseEntity<?> getDoctors() {
        return ResponseEntity.ok(getAllDoctorsEnriched());
    }

    @PostMapping("/doctors/{id}/verify")
    public ResponseEntity<?> verifyDoctor(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        doctor.setVerifiedByAdmin(true);
        doctor.setVerifiedAt(LocalDateTime.now());
        doctorRepository.save(doctor);

        userRepository.findById(doctor.getUserId()).ifPresent(u -> {
            u.setIsVerified(true);
            userRepository.save(u);
        });

        auditLogRepository.log(user.getId(), "DOCTOR_VERIFIED", "DOCTOR", doctor.getId(), "Admin verified physician credentials.", "127.0.0.1");

        return ResponseEntity.ok(Map.of("message", "Physician credentials successfully verified.", "doctorId", id));
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> addDoctor(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);

        String email = ((String) body.get("email")).trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered. Duplicate accounts are prohibited."));
        }

        String phone = (String) body.getOrDefault("phone", "");
        if (!phone.isBlank() && userRepository.existsByPhone(phone.trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this phone number is already registered."));
        }

        String licence = (String) body.get("licenceNumber");
        if (licence != null && !licence.isBlank() && doctorRepository.existsByLicenceNumber(licence.trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "A physician with license number '" + licence.trim() + "' is already registered. Duplicate doctor licenses are prohibited."));
        }

        User docUser = new User();
        docUser.setEmail(email);
        docUser.setPasswordHash(passwordEncoder.encode((String) body.getOrDefault("password", "Doctor@123")));
        docUser.setRole("DOCTOR");
        docUser.setFirstName(((String) body.get("firstName")).trim());
        docUser.setLastName(((String) body.get("lastName")).trim());
        docUser.setPhone(phone.trim());
        docUser.setIsActive(true);
        docUser.setIsVerified(true);
        User savedUser = userRepository.save(docUser);

        Doctor doc = new Doctor();
        doc.setUserId(savedUser.getId());
        doc.setSpecialisation((String) body.get("specialisation"));
        doc.setLicenceNumber(licence != null ? licence.trim() : null);
        doc.setQualification((String) body.get("qualification"));
        doc.setExperienceYears(body.get("experienceYears") != null ? Integer.parseInt(body.get("experienceYears").toString()) : 5);
        doc.setConsultationFee(body.get("consultationFee") != null ? Double.parseDouble(body.get("consultationFee").toString()) : 750.0);
        doc.setHospitalAffiliation((String) body.getOrDefault("hospitalAffiliation", "Health & Cure Super Speciality Hospital"));
        doc.setBiography((String) body.getOrDefault("biography", ""));
        doc.setVerifiedByAdmin(true);
        doc.setVerifiedAt(LocalDateTime.now());
        doctorRepository.save(doc);

        auditLogRepository.log(user.getId(), "DOCTOR_CREATED", "DOCTOR", doc.getId(), "Admin provisioned doctor account: " + email, "127.0.0.1");

        return ResponseEntity.ok(Map.of("message", "Doctor account successfully provisioned."));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        User docUser = userRepository.findById(doctor.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Associated user account not found"));

        if (body.containsKey("firstName")) docUser.setFirstName(((String) body.get("firstName")).trim());
        if (body.containsKey("lastName")) docUser.setLastName(((String) body.get("lastName")).trim());
        if (body.containsKey("phone")) docUser.setPhone(((String) body.get("phone")).trim());
        userRepository.save(docUser);

        if (body.containsKey("specialisation")) doctor.setSpecialisation((String) body.get("specialisation"));
        if (body.containsKey("qualification")) doctor.setQualification((String) body.get("qualification"));
        if (body.containsKey("experienceYears") && body.get("experienceYears") != null) {
            doctor.setExperienceYears(Integer.parseInt(body.get("experienceYears").toString()));
        }
        if (body.containsKey("consultationFee") && body.get("consultationFee") != null) {
            doctor.setConsultationFee(Double.parseDouble(body.get("consultationFee").toString()));
        }
        if (body.containsKey("hospitalAffiliation")) doctor.setHospitalAffiliation((String) body.get("hospitalAffiliation"));
        if (body.containsKey("biography")) doctor.setBiography((String) body.get("biography"));
        if (body.containsKey("licenceNumber")) {
            String newLic = ((String) body.get("licenceNumber")).trim();
            if (!newLic.equalsIgnoreCase(doctor.getLicenceNumber()) && doctorRepository.existsByLicenceNumber(newLic)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Another physician already has medical license number '" + newLic + "'. Duplicate doctor licenses are prohibited."));
            }
            doctor.setLicenceNumber(newLic);
        }
        if (body.containsKey("verifiedByAdmin")) {
            boolean v = Boolean.parseBoolean(body.get("verifiedByAdmin").toString());
            doctor.setVerifiedByAdmin(v);
            if (v && doctor.getVerifiedAt() == null) doctor.setVerifiedAt(LocalDateTime.now());
        }
        doctorRepository.save(doctor);

        auditLogRepository.log(user.getId(), "DOCTOR_UPDATED", "DOCTOR", id, "Admin maintained record for doctor DOC-" + id, "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Physician record maintained successfully.", "doctorId", id));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        Long userId = doctor.getUserId();

        jdbcTemplate.update("UPDATE appointments SET doctor_id = NULL WHERE doctor_id = ?", id);
        jdbcTemplate.update("DELETE FROM access_requests WHERE doctor_id = ?", id);
        doctorRepository.deleteById(id);
        userRepository.deleteById(userId);

        auditLogRepository.log(user.getId(), "DOCTOR_DELETED", "DOCTOR", id, "Admin deleted physician DOC-" + id, "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Physician record permanently deleted.", "doctorId", id));
    }

    // ==========================================
    // PATIENT MANAGEMENT (ROSTER, MAINTAIN, DELETE)
    // ==========================================

    @GetMapping("/patients")
    public ResponseEntity<?> getPatients() {
        return ResponseEntity.ok(getAllPatientsEnriched());
    }

    @PostMapping("/patients")
    public ResponseEntity<?> addPatient(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);

        String email = ((String) body.get("email")).trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "A patient account with this email is already registered. Duplicate records are prohibited."));
        }
        String phone = (String) body.getOrDefault("phone", "");
        if (!phone.isBlank() && userRepository.existsByPhone(phone.trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this phone number is already registered."));
        }

        User patUser = new User();
        patUser.setEmail(email);
        patUser.setPasswordHash(passwordEncoder.encode((String) body.getOrDefault("password", "Patient@123")));
        patUser.setRole("PATIENT");
        patUser.setFirstName(((String) body.get("firstName")).trim());
        patUser.setLastName(((String) body.get("lastName")).trim());
        patUser.setPhone(phone.trim());
        patUser.setIsActive(true);
        patUser.setIsVerified(true);
        User savedUser = userRepository.save(patUser);

        Patient patient = new Patient();
        patient.setUserId(savedUser.getId());
        patient.setGender((String) body.getOrDefault("gender", "Other"));
        patient.setBloodGroup((String) body.getOrDefault("bloodGroup", "O+"));
        patient.setAddress((String) body.getOrDefault("address", ""));
        patient.setEmergencyContact((String) body.getOrDefault("emergencyContact", ""));
        if (body.get("dateOfBirth") != null && !body.get("dateOfBirth").toString().isBlank()) {
            try {
                patient.setDateOfBirth(LocalDate.parse(body.get("dateOfBirth").toString()));
            } catch (Exception ignored) {}
        }
        patientRepository.save(patient);

        auditLogRepository.log(user.getId(), "PATIENT_CREATED", "PATIENT", patient.getId(), "Admin provisioned patient: " + email, "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Patient account successfully provisioned."));
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        User patUser = userRepository.findById(patient.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Associated user account not found"));

        if (body.containsKey("firstName")) patUser.setFirstName(((String) body.get("firstName")).trim());
        if (body.containsKey("lastName")) patUser.setLastName(((String) body.get("lastName")).trim());
        if (body.containsKey("phone")) patUser.setPhone(((String) body.get("phone")).trim());
        userRepository.save(patUser);

        if (body.containsKey("gender")) patient.setGender((String) body.get("gender"));
        if (body.containsKey("bloodGroup")) patient.setBloodGroup((String) body.get("bloodGroup"));
        if (body.containsKey("address")) patient.setAddress((String) body.get("address"));
        if (body.containsKey("emergencyContact")) patient.setEmergencyContact((String) body.get("emergencyContact"));
        if (body.containsKey("dateOfBirth") && body.get("dateOfBirth") != null && !body.get("dateOfBirth").toString().isBlank()) {
            try {
                patient.setDateOfBirth(LocalDate.parse(body.get("dateOfBirth").toString()));
            } catch (Exception ignored) {}
        }
        patientRepository.save(patient);

        auditLogRepository.log(user.getId(), "PATIENT_UPDATED", "PATIENT", id, "Admin maintained record for patient PAT-" + id, "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Patient record maintained successfully.", "patientId", id));
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        Long userId = patient.getUserId();

        jdbcTemplate.update("DELETE FROM appointments WHERE patient_id = ?", id);
        jdbcTemplate.update("DELETE FROM access_requests WHERE patient_id = ?", id);
        jdbcTemplate.update("DELETE FROM prescriptions WHERE record_id IN (SELECT id FROM medical_records WHERE patient_id = ?)", id);
        jdbcTemplate.update("DELETE FROM consultations WHERE record_id IN (SELECT id FROM medical_records WHERE patient_id = ?)", id);
        jdbcTemplate.update("DELETE FROM medical_records WHERE patient_id = ?", id);
        patientRepository.deleteById(id);
        userRepository.deleteById(userId);

        auditLogRepository.log(user.getId(), "PATIENT_DELETED", "PATIENT", id, "Admin permanently deleted patient PAT-" + id + " and records", "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Patient record and associated medical history permanently deleted.", "patientId", id));
    }

    // ==========================================
    // STAFF, DEPARTMENTS, LAB TESTS, SETTINGS, AUDIT
    // ==========================================

    @PostMapping("/staff")
    public ResponseEntity<?> addStaff(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        String empId = (String) body.get("employeeId");
        if (empId == null || empId.isBlank()) {
            empId = "EMP-" + (System.currentTimeMillis() % 100000);
        }
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        String group = (String) body.getOrDefault("roleGroup", (String) body.getOrDefault("role", "General Staff"));
        Long deptId = body.get("departmentId") != null ? Long.valueOf(body.get("departmentId").toString()) : null;
        String phone = (String) body.getOrDefault("phone", "+91 9051579029");

        staffRepository.save(empId, name, email, group, deptId, phone);
        auditLogRepository.log(user.getId(), "STAFF_ADDED", "STAFF", null, "Staff member registered: " + name, "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Staff member registered successfully."));
    }

    @PostMapping("/departments")
    public ResponseEntity<?> addDepartment(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        String name = (String) body.get("name");
        String desc = (String) body.get("description");
        String head = (String) body.get("headDoctorName");

        departmentRepository.save(name, desc, head);
        auditLogRepository.log(user.getId(), "DEPARTMENT_CREATED", "DEPARTMENT", null, "New clinical department created: " + name, "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Department created successfully."));
    }

    @PostMapping("/lab-tests")
    public ResponseEntity<?> addLabTest(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        String name = (String) body.get("name");
        String category = (String) body.get("category");
        double price = Double.parseDouble(body.get("price").toString());
        String desc = (String) body.getOrDefault("description", "");
        String prep = (String) body.getOrDefault("preparationInstructions", "");

        labRepository.saveTest(name, category, price, desc, prep);
        auditLogRepository.log(user.getId(), "LAB_TEST_CREATED", "LAB_TEST", null, "Diagnostic test added: " + name, "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Diagnostic test added to catalog."));
    }

    @PostMapping("/settings")
    public ResponseEntity<?> updateSetting(@RequestBody Map<String, String> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        for (Map.Entry<String, String> e : body.entrySet()) {
            settingsRepository.set(e.getKey(), e.getValue());
        }
        auditLogRepository.log(user.getId(), "SETTINGS_UPDATED", "SYSTEM", null, "Admin updated platform settings.", "127.0.0.1");
        return ResponseEntity.ok(Map.of("message", "Settings saved successfully."));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAll(100));
    }

    @PostMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        String status = body.getOrDefault("status", "CONFIRMED");
        appointmentRepository.findById(id).ifPresent(appt -> {
            appt.setStatus(status);
            appointmentRepository.save(appt);
            auditLogRepository.log(user.getId(), "ADMIN_APPOINTMENT_UPDATED", "APPOINTMENT", id, "Admin updated appointment status to " + status, "127.0.0.1");
        });
        return ResponseEntity.ok(Map.of("message", "Appointment status updated to " + status));
    }
}
