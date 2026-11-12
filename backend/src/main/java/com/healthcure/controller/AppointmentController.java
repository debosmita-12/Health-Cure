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
    public ResponseEntity<Map<String, Object>> bookAppointment(@Valid @RequestBody AppointmentRequest request,
                                                               Authentication auth) {
        Appointment appointment = new Appointment();
        appointment.setPatientName(request.getFullName().trim());
        
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            String cleanPhone = request.getPhone().replaceAll("[^0-9]", "");
            email = (cleanPhone.isEmpty() ? "patient" : cleanPhone) + "@patient.healthcure.local";
        }
        appointment.setPatientEmail(email.trim().toLowerCase());
        appointment.setPatientPhone(request.getPhone().trim());
        appointment.setSpecialty(request.getSpecialty());
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
                        appointment.setPatientId(pOpt.get().getId());
                    } else if ("PATIENT".equalsIgnoreCase(user.getRole())) {
                        Patient newPat = new Patient();
                        newPat.setUserId(user.getId());
                        newPat = patientRepository.save(newPat);
                        appointment.setPatientId(newPat.getId());
                    }
                }
            }
        }

        // Auto-link doctor if doctor exists
        if (doctorRepository != null) {
            List<Doctor> docs = doctorRepository.findAll();
            if (!docs.isEmpty()) {
                // Assign first verified doctor or matching
                appointment.setDoctorId(docs.get(0).getId());
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
