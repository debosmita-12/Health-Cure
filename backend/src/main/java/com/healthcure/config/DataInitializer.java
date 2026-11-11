package com.healthcure.config;

import com.healthcure.model.*;
import com.healthcure.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final RecordRepository recordRepository;
    private final AccessRepository accessRepository;
    private final AuditLogRepository auditLogRepository;
    private final DepartmentRepository departmentRepository;
    private final StaffRepository staffRepository;
    private final LabRepository labRepository;
    private final BillingRepository billingRepository;
    private final VitalsRepository vitalsRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final SettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository,
                           AppointmentRepository appointmentRepository,
                           RecordRepository recordRepository,
                           AccessRepository accessRepository,
                           AuditLogRepository auditLogRepository,
                           DepartmentRepository departmentRepository,
                           StaffRepository staffRepository,
                           LabRepository labRepository,
                           BillingRepository billingRepository,
                           VitalsRepository vitalsRepository,
                           DoctorScheduleRepository scheduleRepository,
                           SettingsRepository settingsRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.recordRepository = recordRepository;
        this.accessRepository = accessRepository;
        this.auditLogRepository = auditLogRepository;
        this.departmentRepository = departmentRepository;
        this.staffRepository = staffRepository;
        this.labRepository = labRepository;
        this.billingRepository = billingRepository;
        this.vitalsRepository = vitalsRepository;
        this.scheduleRepository = scheduleRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@healthcure.local").isPresent()) {
            return;
        }

        // 1. Departments
        departmentRepository.save("Cardiology & Vascular", "Comprehensive heart care, preventive screening and diagnostic ECG", "Dr. Marcus Vance");
        departmentRepository.save("Orthopedics & Joint", "Musculoskeletal rehabilitation, joint therapy and surgical consult", "Dr. David Chen");
        departmentRepository.save("Pediatrics & Family Care", "Infant and adolescent wellness, developmental tracking and immunizations", "Dr. Elena Rostova");
        departmentRepository.save("General Medicine", "Primary healthcare exams, chronic disease management and wellness checkups", "Dr. Sarah Jenkins");

        // 2. Superadmin User (Canonical Role: SUPERADMIN)
        User superadmin = new User();
        superadmin.setEmail("admin@healthcure.local");
        superadmin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        superadmin.setRole("SUPERADMIN");
        superadmin.setFirstName("Super");
        superadmin.setLastName("Admin");
        superadmin.setPhone("+1 (555) 900-0001");
        superadmin.setIsActive(true);
        superadmin.setIsVerified(true);
        User savedAdmin = userRepository.save(superadmin);

        // 3. Doctor User & Profile
        User doctorUser = new User();
        doctorUser.setEmail("doctor@healthcure.local");
        doctorUser.setPasswordHash(passwordEncoder.encode("Doctor@123"));
        doctorUser.setRole("DOCTOR");
        doctorUser.setFirstName("Dr. Marcus");
        doctorUser.setLastName("Vance");
        doctorUser.setPhone("+1 (555) 345-6789");
        doctorUser.setIsActive(true);
        doctorUser.setIsVerified(true);
        User savedDocUser = userRepository.save(doctorUser);

        Doctor doctor = new Doctor();
        doctor.setUserId(savedDocUser.getId());
        doctor.setSpecialisation("Cardiology & Preventive Care");
        doctor.setLicenceNumber("MED-CARD-9921");
        doctor.setQualification("MD, FACC - Harvard Medical School");
        doctor.setExperienceYears(14);
        doctor.setVerifiedByAdmin(true);
        doctor.setVerifiedAt(LocalDateTime.now().minusMonths(6));
        Doctor savedDoc = doctorRepository.save(doctor);

        scheduleRepository.save(savedDoc.getId(), "Monday", "09:00", "17:00", 30);
        scheduleRepository.save(savedDoc.getId(), "Wednesday", "09:00", "17:00", 30);
        scheduleRepository.save(savedDoc.getId(), "Friday", "09:00", "15:00", 30);

        // 4. Patient User & Profile
        User patientUser = new User();
        patientUser.setEmail("patient@healthcure.local");
        patientUser.setPasswordHash(passwordEncoder.encode("Patient@123"));
        patientUser.setRole("PATIENT");
        patientUser.setFirstName("Eleanor");
        patientUser.setLastName("Hayes");
        patientUser.setPhone("+1 (555) 019-2831");
        patientUser.setIsActive(true);
        patientUser.setIsVerified(true);
        User savedPatientUser = userRepository.save(patientUser);

        Patient patient = new Patient();
        patient.setUserId(savedPatientUser.getId());
        patient.setDateOfBirth(LocalDate.of(1988, 5, 14));
        patient.setGender("Female");
        patient.setBloodGroup("O+");
        patient.setAddress("42 Greenfield Ave, Boston, MA");
        patient.setEmergencyContact("+1 (555) 234-5678");
        Patient savedPatient = patientRepository.save(patient);

        // 5. Patient Vitals
        vitalsRepository.save(savedPatient.getId(), "118/76", 68, 98.4, 14, 99, 22.4, 88.0);

        // 6. Medical Records
        MedicalRecord record1 = new MedicalRecord();
        record1.setPatientId(savedPatient.getId());
        record1.setDoctorId(savedDoc.getId());
        record1.setRecordType("REPORT");
        record1.setTitle("Comprehensive Cardiovascular Examination");
        record1.setDescription("Resting 12-lead ECG showed regular sinus rhythm at 68 bpm. Blood pressure: 118/76 mmHg. No signs of ischemia or conduction delay.");
        record1.setFileType("application/pdf");
        recordRepository.save(record1);

        MedicalRecord record2 = new MedicalRecord();
        record2.setPatientId(savedPatient.getId());
        record2.setDoctorId(savedDoc.getId());
        record2.setRecordType("CONSULTATION");
        record2.setTitle("Annual Preventive Health Consultation");
        record2.setDescription("Patient is active and asymptomatic. Advised continuance of Mediterranean dietary pattern and 150 minutes weekly aerobic activity.");
        record2.setFileType("text/plain");
        recordRepository.save(record2);

        // 7. Sample Appointment
        Appointment appt = new Appointment();
        appt.setPatientId(savedPatient.getId());
        appt.setDoctorId(savedDoc.getId());
        appt.setPatientName("Eleanor Hayes");
        appt.setPatientEmail("patient@healthcure.local");
        appt.setPatientPhone("+1 (555) 019-2831");
        appt.setSpecialty("Cardiology & Preventive Care");
        appt.setConsultationType("In-Clinic Visit");
        appt.setTimeSlot("Morning (09:00 - 12:00)");
        appt.setPreferredDoctor("Dr. Marcus Vance");
        appt.setAppointmentDate(LocalDateTime.now().plusDays(4));
        appt.setStatus("CONFIRMED");
        appt.setReferenceCode("HC-DEMO-001");
        Appointment savedAppt = appointmentRepository.save(appt);

        // 8. Invoices & Billing
        billingRepository.createInvoice(savedPatient.getId(), savedAppt.getId(), "HC-INV-2026-001", 75.00, "PAID", "Card", "Cardiology Consultation & Record Archive");

        // 9. Lab Tests Catalog
        labRepository.saveTest("Complete Blood Count (CBC)", "Hematology", 25.00, "Measures red blood cells, white blood cells, and platelets.", "Fasting not strictly required.");
        labRepository.saveTest("Comprehensive Metabolic Panel (CMP)", "Biochemistry", 45.00, "Assesses kidney function, liver function, and electrolyte balances.", "10-12 hour fasting required.");
        labRepository.saveTest("Lipid Panel & Cholesterol Breakdown", "Cardiology", 35.00, "Measures Total, HDL, LDL cholesterol, and Triglycerides.", "12 hour fasting required.");
        labRepository.saveTest("Resting 12-Lead Electrocardiogram (ECG)", "Diagnostics", 50.00, "Records electrical signals of the heart.", "Avoid caffeine 4 hours prior.");

        // 10. Staff Members
        staffRepository.save("EMP-101", "Clara Oswald", "clara@healthcure.local", "Receptionist", 1L, "+1 555 444 001");
        staffRepository.save("EMP-102", "Martha Jones", "martha@healthcure.local", "Nurse Coordinator", 1L, "+1 555 444 002");
        staffRepository.save("EMP-103", "Rory Williams", "rory@healthcure.local", "Laboratory Technician", 2L, "+1 555 444 003");

        // 11. Active Consent Request
        AccessRequest access = new AccessRequest();
        access.setDoctorId(savedDoc.getId());
        access.setPatientId(savedPatient.getId());
        access.setStatus("APPROVED");
        access.setReason("Pre-consultation cardiac medical history inspection");
        access.setRequestedAt(LocalDateTime.now().minusHours(24));
        access.setRespondedAt(LocalDateTime.now().minusHours(20));
        access.setExpiresAt(LocalDateTime.now().plusDays(6));
        accessRepository.save(access);

        // 12. System Settings
        settingsRepository.set("center_name", "Health & Cure Connected Care Centre");
        settingsRepository.set("emergency_phone", "+1 (555) 911-CURE");
        settingsRepository.set("record_retention_years", "7");
        settingsRepository.set("consultation_buffer_minutes", "15");

        // 13. Audit Log
        auditLogRepository.log(savedAdmin.getId(), "SYSTEM_INIT", "PLATFORM", savedAdmin.getId(), "Three-role healthcare platform initialized with Superadmin, Doctor and Patient structures.", "127.0.0.1");
    }
}
