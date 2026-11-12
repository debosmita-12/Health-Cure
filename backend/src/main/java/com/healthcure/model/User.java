package com.healthcure.model;

import java.time.LocalDateTime;

public class User {
    private Long id;
    private String email;
    private String passwordHash;
    private String role; // PATIENT, DOCTOR, ADMIN
    private String firstName;
    private String lastName;
    private String phone;
    private Boolean isActive;
    private Boolean isVerified;
    private String provider = "LOCAL";
    private String providerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public User() {}

    public User(Long id, String email, String passwordHash, String role, String firstName, String lastName, String phone, Boolean isActive, Boolean isVerified, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.isActive = isActive;
        this.isVerified = isVerified;
        this.provider = "LOCAL";
        this.providerId = null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean verified) { isVerified = verified; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
