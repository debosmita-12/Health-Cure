package com.healthcure.model;

import java.time.LocalDateTime;

public class Doctor {
    private Long id;
    private Long userId;
    private String specialisation;
    private String licenceNumber;
    private String qualification;
    private Integer experienceYears;
    private Boolean verifiedByAdmin;
    private LocalDateTime verifiedAt;

    public Doctor() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getSpecialisation() { return specialisation; }
    public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }

    public String getLicenceNumber() { return licenceNumber; }
    public void setLicenceNumber(String licenceNumber) { this.licenceNumber = licenceNumber; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public Boolean getVerifiedByAdmin() { return verifiedByAdmin; }
    public void setVerifiedByAdmin(Boolean verifiedByAdmin) { this.verifiedByAdmin = verifiedByAdmin; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
