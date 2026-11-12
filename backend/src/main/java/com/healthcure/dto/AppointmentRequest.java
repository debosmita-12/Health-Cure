package com.healthcure.dto;

public class AppointmentRequest {
    private String fullName;
    private String email;
    private String phone;
    private String appointmentDate;
    private String timeSlot;
    private String consultationType;
    private String specialty;
    private String preferredDoctor;
    private String notes;
    private Boolean googleAuthenticated;

    public AppointmentRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getConsultationType() { return consultationType; }
    public void setConsultationType(String consultationType) { this.consultationType = consultationType; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getPreferredDoctor() { return preferredDoctor; }
    public void setPreferredDoctor(String preferredDoctor) { this.preferredDoctor = preferredDoctor; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getGoogleAuthenticated() { return googleAuthenticated; }
    public void setGoogleAuthenticated(Boolean googleAuthenticated) { this.googleAuthenticated = googleAuthenticated; }
}
