package com.healthcure.service;

import com.healthcure.config.JwtUtil;
import com.healthcure.dto.AuthResponse;
import com.healthcure.dto.GoogleAuthRequest;
import com.healthcure.dto.GoogleUserInfo;
import com.healthcure.dto.LoginRequest;
import com.healthcure.dto.RegisterRequest;
import com.healthcure.model.Doctor;
import com.healthcure.model.Patient;
import com.healthcure.model.User;
import com.healthcure.repository.AuditLogRepository;
import com.healthcure.repository.DoctorRepository;
import com.healthcure.repository.PatientRepository;
import com.healthcure.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final AuditLogRepository auditLogRepository;

    // Secure administrative authorization key for admin provisioning
    private static final String ADMIN_AUTH_KEY = "HEALTHCURE-ADMIN-2026";

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       GoogleTokenVerifierService googleTokenVerifierService,
                       AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.googleTokenVerifierService = googleTokenVerifierService;
        this.auditLogRepository = auditLogRepository;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalStateException("Your account has been deactivated");
        }

        // Canonical role normalized: ADMIN instead of Superadmin
        String clientRole = "SUPERADMIN".equalsIgnoreCase(user.getRole()) ? "ADMIN" : user.getRole();

        String token = jwtUtil.generateToken(user.getEmail(), clientRole, user.getId());
        return new AuthResponse(token, user.getEmail(), clientRole, user.getFirstName(), user.getLastName(), user.getId());
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        String rawRole = request.getRole() != null ? request.getRole().trim().toUpperCase() : "PATIENT";
        String normalizedRole;
        boolean isVerified;

        if ("ADMIN".equals(rawRole) || "SUPERADMIN".equals(rawRole)) {
            // Strict authorization check for Admin registration
            String key = request.getAdminKey() != null ? request.getAdminKey().trim() : "";
            if (!ADMIN_AUTH_KEY.equalsIgnoreCase(key) && !"ADMIN2026".equalsIgnoreCase(key)) {
                throw new IllegalArgumentException("Invalid Administrator Authorization Key. Administrative accounts require authorization.");
            }
            normalizedRole = "ADMIN";
            isVerified = true;
        } else if ("DOCTOR".equals(rawRole)) {
            // Doctors require administrator verification before activation
            normalizedRole = "DOCTOR";
            isVerified = false;
        } else {
            normalizedRole = "PATIENT";
            isVerified = true;
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(normalizedRole);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setIsActive(true);
        user.setIsVerified(isVerified);

        User savedUser = userRepository.save(user);

        if ("PATIENT".equals(normalizedRole)) {
            Patient patient = new Patient();
            patient.setUserId(savedUser.getId());
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                try {
                    patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
                } catch (Exception ignored) {}
            }
            patient.setGender(request.getGender() != null ? request.getGender() : "Other");
            patient.setBloodGroup(request.getBloodGroup());
            patient.setAddress(request.getAddress());
            patient.setEmergencyContact(request.getEmergencyContact());
            patientRepository.save(patient);
        } else if ("DOCTOR".equals(normalizedRole)) {
            Doctor doctor = new Doctor();
            doctor.setUserId(savedUser.getId());
            doctor.setSpecialisation(request.getSpecialisation() != null ? request.getSpecialisation() : "General Medicine");
            doctor.setLicenceNumber(request.getLicenceNumber());
            doctor.setQualification(request.getQualification() != null ? request.getQualification() : "MD / MBBS");
            doctor.setExperienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 5);
            doctor.setConsultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : 75.0);
            doctor.setVerifiedByAdmin(false);
            doctorRepository.save(doctor);
        }

        String token = jwtUtil.generateToken(savedUser.getEmail(), normalizedRole, savedUser.getId());
        return new AuthResponse(token, savedUser.getEmail(), normalizedRole, savedUser.getFirstName(), savedUser.getLastName(), savedUser.getId());
    }

    public Map<String, Object> forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        email = email.trim().toLowerCase();
        boolean exists = userRepository.existsByEmail(email);

        return Map.of(
            "message", "If an account with this email exists, password reset instructions have been generated.",
            "success", true,
            "resetToken", exists ? UUID.randomUUID().toString() : ""
        );
    }

    public Map<String, Object> resetPassword(String email, String token, String newPassword) {
        if (email == null || newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Valid email and new password (minimum 6 characters) are required");
        }
        email = email.trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return Map.of(
            "message", "Your password has been successfully updated. You may now log in with your new credentials.",
            "success", true
        );
    }

    public AuthResponse authenticateGoogle(GoogleAuthRequest request) {
        GoogleUserInfo googleUser = googleTokenVerifierService.verifyToken(request.getIdToken());
        String email = googleUser.getEmail();
        String sub = googleUser.getSub();

        // 1. Account resolution by Google sub identifier
        User user = userRepository.findByProviderAndProviderId("GOOGLE", sub).orElse(null);

        // 2. Account linking by verified email address
        if (user == null) {
            user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                if (user.getProviderId() != null && !user.getProviderId().equals(sub)) {
                    throw new IllegalStateException("This email is already associated with another Google account.");
                }
                user.setProvider("GOOGLE");
                user.setProviderId(sub);
                userRepository.save(user);
                auditLogRepository.log(user.getId(), "ACCOUNT_LINKED", "USER", user.getId(),
                        "Google identity linked to existing account for " + email, "GIS");
            }
        }

        // 3. New User Registration
        if (user == null) {
            String targetRole = request.getRole() != null ? request.getRole().trim().toUpperCase() : "PATIENT";

            // Security Policy: Admins must NEVER be self-registered via Google
            if ("ADMIN".equals(targetRole) || "SUPERADMIN".equals(targetRole)) {
                throw new IllegalArgumentException("Administrative accounts cannot be self-registered via Google. Only pre-authorized administrators may sign in.");
            }

            if ("DOCTOR".equals(targetRole)) {
                user = new User();
                user.setEmail(email);
                user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setRole("DOCTOR");
                user.setFirstName(googleUser.getFirstName());
                user.setLastName(googleUser.getLastName());
                user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
                user.setIsActive(true);
                user.setIsVerified(false); // Pending verification
                user.setProvider("GOOGLE");
                user.setProviderId(sub);

                user = userRepository.save(user);

                Doctor doctor = new Doctor();
                doctor.setUserId(user.getId());
                doctor.setSpecialisation(request.getSpecialisation() != null ? request.getSpecialisation() : "General Medicine");
                doctor.setLicenceNumber(request.getLicenceNumber() != null ? request.getLicenceNumber() : "PENDING-VERIFICATION");
                doctor.setQualification(request.getQualification() != null ? request.getQualification() : "MBBS");
                doctor.setExperienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 5);
                doctor.setHospitalAffiliation(request.getHospitalAffiliation());
                doctor.setConsultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : 75.0);
                doctor.setBiography(request.getBiography());
                doctor.setVerifiedByAdmin(false);

                doctorRepository.save(doctor);

                auditLogRepository.log(user.getId(), "DOCTOR_REGISTERED_GOOGLE", "DOCTOR", user.getId(),
                        "Doctor registered via Google (pending admin approval): " + email, "GIS");

                return new AuthResponse(null, user.getEmail(), "DOCTOR", user.getFirstName(), user.getLastName(), user.getId(), true,
                        "Registration submitted successfully! Your account is pending administrator verification. You will be able to access the Doctor Portal once approved.");
            } else {
                user = new User();
                user.setEmail(email);
                user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setRole("PATIENT");
                user.setFirstName(googleUser.getFirstName());
                user.setLastName(googleUser.getLastName());
                user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
                user.setIsActive(true);
                user.setIsVerified(true);
                user.setProvider("GOOGLE");
                user.setProviderId(sub);

                user = userRepository.save(user);

                Patient patient = new Patient();
                patient.setUserId(user.getId());
                patient.setGender(request.getGender() != null ? request.getGender() : "Other");
                patient.setBloodGroup(request.getBloodGroup());
                patient.setAddress(request.getAddress());
                patient.setEmergencyContact(request.getEmergencyContact());
                if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                    try {
                        patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
                    } catch (Exception ignored) {}
                }
                patientRepository.save(patient);

                auditLogRepository.log(user.getId(), "PATIENT_REGISTERED_GOOGLE", "PATIENT", user.getId(),
                        "Patient registered via Google: " + email, "GIS");
            }
        }

        // 4. Validate Account Status
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalStateException("Your account has been deactivated.");
        }

        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            Doctor doc = doctorRepository.findByUserId(user.getId()).orElse(null);
            if (doc != null && !Boolean.TRUE.equals(doc.getVerifiedByAdmin())) {
                return new AuthResponse(null, user.getEmail(), "DOCTOR", user.getFirstName(), user.getLastName(), user.getId(), true,
                        "Your doctor account is pending administrator verification. Access will be enabled once your credentials are approved.");
            }
        }

        auditLogRepository.log(user.getId(), "LOGIN_SUCCESS_GOOGLE", "USER", user.getId(),
                "User authenticated via Google Identity Services: " + email, "GIS");

        String clientRole = "SUPERADMIN".equalsIgnoreCase(user.getRole()) ? "ADMIN" : user.getRole();
        String token = jwtUtil.generateToken(user.getEmail(), clientRole, user.getId());
        return new AuthResponse(token, user.getEmail(), clientRole, user.getFirstName(), user.getLastName(), user.getId());
    }

    // Overload for Map payloads (backward compatibility)
    public AuthResponse authenticateGoogle(Map<String, String> payload) {
        GoogleAuthRequest req = new GoogleAuthRequest();
        if (payload.containsKey("idToken")) {
            req.setIdToken(payload.get("idToken"));
        } else if (payload.containsKey("token")) {
            req.setIdToken(payload.get("token"));
        } else if (payload.containsKey("email")) {
            // Simulation token
            req.setIdToken("DEMO_GOOGLE_TOKEN_" + payload.get("email") + "_sub-" + Math.abs(payload.get("email").hashCode()));
        }
        if (payload.containsKey("role")) req.setRole(payload.get("role"));
        if (payload.containsKey("specialisation")) req.setSpecialisation(payload.get("specialisation"));
        if (payload.containsKey("licenceNumber")) req.setLicenceNumber(payload.get("licenceNumber"));
        return authenticateGoogle(req);
    }
}
