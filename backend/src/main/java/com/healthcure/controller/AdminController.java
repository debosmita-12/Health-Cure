package com.healthcure.controller;

import com.healthcure.model.Doctor;
import com.healthcure.model.Patient;
import com.healthcure.model.User;
import com.healthcure.repository.*;
import org.springframework.http.ResponseEntity;
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
                           PasswordEncoder passwordEncoder) {
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
    }

    private User getAuthenticatedUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
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
        data.put("doctors", doctorRepository.findAll());
        data.put("appointments", appointmentRepository.findAll());
        data.put("auditLogs", auditLogRepository.findAll(40));
        data.put("departments", departmentRepository.findAll());
        data.put("staff", staffRepository.findAll());
        data.put("billing", billingRepository.findAll());
        data.put("labTests", labRepository.findAllTests());
        data.put("settings", settingsRepository.getAll());

        return ResponseEntity.ok(data);
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

        auditLogRepository.log(user.getId(), "DOCTOR_VERIFIED", "DOCTOR", doctor.getId(), "Superadmin verified physician credentials.", "127.0.0.1");

        return ResponseEntity.ok(Map.of("message", "Physician credentials successfully verified.", "doctorId", id));
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> addDoctor(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getAuthenticatedUser(auth);

        String email = ((String) body.get("email")).trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use."));
        }

        User docUser = new User();
        docUser.setEmail(email);
        docUser.setPasswordHash(passwordEncoder.encode((String) body.getOrDefault("password", "Doctor@123")));
        docUser.setRole("DOCTOR");
        docUser.setFirstName((String) body.get("firstName"));
        docUser.setLastName((String) body.get("lastName"));
        docUser.setPhone((String) body.getOrDefault("phone", ""));
        docUser.setIsActive(true);
        docUser.setIsVerified(true);
        User savedUser = userRepository.save(docUser);

        Doctor doc = new Doctor();
        doc.setUserId(savedUser.getId());
        doc.setSpecialisation((String) body.get("specialisation"));
        doc.setLicenceNumber((String) body.get("licenceNumber"));
        doc.setQualification((String) body.get("qualification"));
        doc.setExperienceYears(body.get("experienceYears") != null ? Integer.valueOf(body.get("experienceYears").toString()) : 5);
        doc.setVerifiedByAdmin(true);
        doc.setVerifiedAt(LocalDateTime.now());
        doctorRepository.save(doc);

        auditLogRepository.log(user.getId(), "DOCTOR_CREATED", "DOCTOR", doc.getId(), "Superadmin provisioned doctor account: " + email, "127.0.0.1");

        return ResponseEntity.ok(Map.of("message", "Doctor account successfully provisioned."));
    }

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
        auditLogRepository.log(user.getId(), "SETTINGS_UPDATED", "SYSTEM", null, "Superadmin updated platform settings.", "127.0.0.1");
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
            auditLogRepository.log(user.getId(), "ADMIN_APPOINTMENT_UPDATED", "APPOINTMENT", id, "Superadmin updated appointment status to " + status, "127.0.0.1");
        });
        return ResponseEntity.ok(Map.of("message", "Appointment status updated to " + status));
    }
}
