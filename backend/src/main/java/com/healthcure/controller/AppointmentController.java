package com.healthcure.controller;

import com.healthcure.dto.AppointmentRequest;
import com.healthcure.model.Appointment;
import com.healthcure.repository.AppointmentRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;

    public AppointmentController(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        Appointment appointment = new Appointment();
        appointment.setPatientName(request.getFullName());
        appointment.setPatientEmail(request.getEmail());
        appointment.setPatientPhone(request.getPhone());
        appointment.setSpecialty(request.getSpecialty());
        appointment.setConsultationType(request.getConsultationType());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setPreferredDoctor(request.getPreferredDoctor());
        appointment.setNotes(request.getNotes());
        appointment.setGoogleAuthenticated(Boolean.TRUE.equals(request.getGoogleAuthenticated()));
        appointment.setStatus("REQUESTED");

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
