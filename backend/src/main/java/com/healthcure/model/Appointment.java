package com.healthcure.model;

import java.time.LocalDateTime;

public class Appointment {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String specialty;
    private String consultationType;
    private String timeSlot;
    private String preferredDoctor;
    private LocalDateTime appointmentDate;
    private String status; // REQUESTED, CONFIRMED, CANCELLED, COMPLETED
    private String notes;
    private Boolean googleAuthenticated;
    private String referenceCode;
    private LocalDateTime createdAt;

    public Appointment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getConsultationType() { return consultationType; }
    public void setConsultationType(String consultationType) { this.consultationType = consultationType; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getPreferredDoctor() { return preferredDoctor; }
    public void setPreferredDoctor(String preferredDoctor) { this.preferredDoctor = preferredDoctor; }

    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getGoogleAuthenticated() { return googleAuthenticated; }
    public void setGoogleAuthenticated(Boolean googleAuthenticated) { this.googleAuthenticated = googleAuthenticated; }

    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
