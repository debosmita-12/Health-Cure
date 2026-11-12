package com.healthcure.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {
    @NotBlank(message = "Google ID Token is required")
    private String idToken;

    private String role; // "PATIENT", "DOCTOR", "ADMIN"

    // Patient optional fields
    private String phone;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String emergencyContact;

    // Doctor professional fields
    private String specialisation;
    private String licenceNumber;
    private String qualification;
    private Integer experienceYears;
    private String hospitalAffiliation;
    private Double consultationFee;
    private String biography;

    public GoogleAuthRequest() {}

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getSpecialisation() { return specialisation; }
    public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }

    public String getLicenceNumber() { return licenceNumber; }
    public void setLicenceNumber(String licenceNumber) { this.licenceNumber = licenceNumber; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getHospitalAffiliation() { return hospitalAffiliation; }
    public void setHospitalAffiliation(String hospitalAffiliation) { this.hospitalAffiliation = hospitalAffiliation; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }
}
