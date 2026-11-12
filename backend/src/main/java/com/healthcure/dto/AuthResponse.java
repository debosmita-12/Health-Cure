package com.healthcure.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private Long userId;
    private Boolean pendingVerification = false;
    private String message;
    private Long patientId;
    private String bloodGroup;
    private String gender;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String role, String firstName, String lastName, Long userId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.userId = userId;
        this.pendingVerification = false;
    }

    public AuthResponse(String token, String email, String role, String firstName, String lastName, Long userId, Boolean pendingVerification, String message) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.userId = userId;
        this.pendingVerification = pendingVerification;
        this.message = message;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Boolean getPendingVerification() { return pendingVerification; }
    public void setPendingVerification(Boolean pendingVerification) { this.pendingVerification = pendingVerification; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}
