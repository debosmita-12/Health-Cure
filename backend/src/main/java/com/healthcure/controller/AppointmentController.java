package com.healthcure.controller;

import com.healthcure.dto.AppointmentRequest;
import com.healthcure.model.Appointment;
import com.healthcure.model.Doctor;
import com.healthcure.model.Patient;
import com.healthcure.model.User;
import com.healthcure.repository.AppointmentRepository;
import com.healthcure.repository.DoctorRepository;
import com.healthcure.repository.PatientRepository;
import com.healthcure.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                 UserRepository userRepository,
                                 PatientRepository patientRepository,
                                 DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> bookAppointment(@RequestBody AppointmentRequest request,
                                                               Authentication auth) {
        Appointment appointment = new Appointment();

        // Resolve authenticated user if available
        User authUser = null;
        if (userRepository != null && auth != null && auth.getName() != null) {
            authUser = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        String name = request.getFullName();
        if ((name == null || name.isBlank()) && authUser != null) {
            name = (authUser.getFirstName() + " " + authUser.getLastName()).trim();
        }
        if (name == null || name.isBlank()) {
            name = "Patient";
        }
        appointment.setPatientName(name);

        String phone = request.getPhone();
        if ((phone == null || phone.isBlank()) && authUser != null) {
            phone = authUser.getPhone();
        }
        if (phone == null || phone.isBlank()) {
            phone = "+91 9051579029";
        }
        appointment.setPatientPhone(phone.trim());

        String email = request.getEmail();
        if ((email == null || email.isBlank()) && authUser != null) {
            email = authUser.getEmail();
        }
        if (email == null || email.isBlank()) {
            String cleanPhone = phone.replaceAll("[^0-9]", "");
            email = (cleanPhone.isEmpty() ? "patient" : cleanPhone) + "@patient.healthcure.local";
        }
        appointment.setPatientEmail(email.trim().toLowerCase());
        String specialty = request.getSpecialty() != null && !request.getSpecialty().isBlank() ? request.getSpecialty() : "General Medicine";
        appointment.setSpecialty(specialty);
        appointment.setConsultationType(request.getConsultationType());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setPreferredDoctor(request.getPreferredDoctor());
        appointment.setNotes(request.getNotes());
        appointment.setGoogleAuthenticated(Boolean.TRUE.equals(request.getGoogleAuthenticated()));
        appointment.setStatus("CONFIRMED");

        // Link to authenticated patient or matched patient by email
        if (userRepository != null) {
            String checkEmail = auth != null && auth.getName() != null ? auth.getName() : appointment.getPatientEmail();
            Optional<User> uOpt = userRepository.findByEmail(checkEmail);
            if (uOpt.isPresent()) {
                User user = uOpt.get();
                if (patientRepository != null) {
                    Optional<Patient> pOpt = patientRepository.findByUserId(user.getId());
                    if (pOpt.isPresent()) {
                        Patient p = pOpt.get();
                        appointment.setPatientId(p.getId());
                        appointment.setPatientGender(p.getGender());
                        appointment.setPatientBloodGroup(p.getBloodGroup());
                        if (p.getDateOfBirth() != null) {
                            appointment.setPatientDob(p.getDateOfBirth().toString());
                        }
                        appointment.setPatientAddress(p.getAddress());
                        appointment.setEmergencyContact(p.getEmergencyContact());
                    } else if ("PATIENT".equalsIgnoreCase(user.getRole())) {
                        Patient newPat = new Patient();
                        newPat.setUserId(user.getId());
                        newPat = patientRepository.save(newPat);
                        appointment.setPatientId(newPat.getId());
                    }
                }
            }
        }

        // Department-level uniqueness check for active appointments
        Long checkPatientId = appointment.getPatientId();
        String checkPatientEmail = appointment.getPatientEmail();
        if (appointmentRepository.hasActiveAppointmentInDepartment(checkPatientId, checkPatientEmail, specialty)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "You already have an active appointment scheduled in " + specialty + ". Patients can book multiple appointments across different departments, but not multiple active appointments in the same department."
            ));
        }

        // Auto-link doctor if doctor exists
        if (doctorRepository != null) {
            List<Doctor> docs = doctorRepository.findAll();
            if (!docs.isEmpty()) {
                Doctor chosenDoc = null;
                if (request.getPreferredDoctor() != null && !request.getPreferredDoctor().isBlank()) {
                    String pref = request.getPreferredDoctor().toLowerCase();
                    for (Doctor d : docs) {
                        User du = userRepository.findById(d.getUserId()).orElse(null);
                        if (du != null && (du.getFirstName() + " " + du.getLastName()).toLowerCase().contains(pref)) {
                            chosenDoc = d;
                            break;
                        }
                    }
                }
                if (chosenDoc == null && specialty != null) {
                    for (Doctor d : docs) {
                        if (specialty.equalsIgnoreCase(d.getSpecialisation())) {
                            chosenDoc = d;
                            break;
                        }
                    }
                }
                if (chosenDoc == null) {
                    chosenDoc = docs.get(0);
                }
                appointment.setDoctorId(chosenDoc.getId());
            }
        }

        if (request.getAppointmentDate() != null && !request.getAppointmentDate().isBlank()) {
            try {
                appointment.setAppointmentDate(LocalDateTime.parse(request.getAppointmentDate()));
            } catch (Exception e) {
                appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
            }
        } else {
            appointment.setAppointmentDate(LocalDateTime.now().plusDays(1));
        }

        String referenceCode = "HC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        appointment.setReferenceCode(referenceCode);

        Appointment saved = appointmentRepository.save(appointment);

        return ResponseEntity.ok(Map.of(
                "status", "CONFIRMED",
                "referenceCode", referenceCode,
                "id", saved.getId(),
                "message", "Appointment successfully registered in the Health & Cure platform.",
                "patientName", saved.getPatientName(),
                "patientEmail", saved.getPatientEmail(),
                "specialty", saved.getSpecialty() != null ? saved.getSpecialty() : "General Practice",
                "timeSlot", saved.getTimeSlot() != null ? saved.getTimeSlot() : "Morning (09:00 - 12:00)"
        ));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<Map<String, Object>> getAvailableSlots() {
        return ResponseEntity.ok(Map.of(
                "timeSlots", List.of(
                        "Morning (09:00 - 12:00)",
                        "Afternoon (12:00 - 16:00)",
                        "Evening (16:00 - 19:00)"
                ),
                "specialties", List.of(
                        "General Healthcare",
                        "Specialist Care (Cardiology, Orthopedics)",
                        "Prescription Care & Refill",
                        "Diagnostic Records & Lab Review",
                        "Pediatric & Family Care",
                        "Emergency Consultation"
                ),
                "consultationTypes", List.of(
                        "In-Clinic Visit",
                        "Video Consultation",
                        "Diagnostic Records Review"
                )
        ));
    }

    @GetMapping("/by-reference/{code}")
    public ResponseEntity<?> getByReference(@PathVariable String code) {
        return appointmentRepository.findByReferenceCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
