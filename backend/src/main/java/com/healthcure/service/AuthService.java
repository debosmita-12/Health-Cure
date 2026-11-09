package com.healthcure.service;

import com.healthcure.config.JwtUtil;
import com.healthcure.dto.AuthResponse;
import com.healthcure.dto.LoginRequest;
import com.healthcure.dto.RegisterRequest;
import com.healthcure.model.Doctor;
import com.healthcure.model.Patient;
import com.healthcure.model.User;
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

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
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

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
        return new AuthResponse(token, user.getEmail(), user.getRole(), user.getFirstName(), user.getLastName(), user.getId());
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        String role = request.getRole().toUpperCase();
        if (!role.equals("PATIENT") && !role.equals("DOCTOR")) {
            throw new IllegalArgumentException("Invalid role. Must be PATIENT or DOCTOR");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setIsActive(true);
        // Doctors require admin verification
        user.setIsVerified(role.equals("PATIENT"));

        User savedUser = userRepository.save(user);

        if (role.equals("PATIENT")) {
            Patient patient = new Patient();
            patient.setUserId(savedUser.getId());
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            }
            patient.setGender(request.getGender());
            patient.setBloodGroup(request.getBloodGroup());
            patient.setAddress(request.getAddress());
            patientRepository.save(patient);
        } else {
            Doctor doctor = new Doctor();
            doctor.setUserId(savedUser.getId());
            doctor.setSpecialisation(request.getSpecialisation());
            doctor.setLicenceNumber(request.getLicenceNumber());
            doctor.setQualification(request.getQualification());
            doctor.setExperienceYears(request.getExperienceYears());
            doctor.setVerifiedByAdmin(false);
            doctorRepository.save(doctor);
        }

        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getId());
        return new AuthResponse(token, savedUser.getEmail(), savedUser.getRole(), savedUser.getFirstName(), savedUser.getLastName(), savedUser.getId());
    }

    public AuthResponse authenticateGoogle(Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required for Google authentication");
        }

        email = email.trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole("PATIENT"); // Google auth strictly registers as Patient; doctors require credentials
            String[] parts = (name != null ? name : "Google User").split(" ", 2);
            user.setFirstName(parts[0]);
            user.setLastName(parts.length > 1 ? parts[1] : "");
            user.setPhone("");
            user.setIsActive(true);
            user.setIsVerified(true);

            user = userRepository.save(user);

            Patient patient = new Patient();
            patient.setUserId(user.getId());
            patientRepository.save(patient);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
        return new AuthResponse(token, user.getEmail(), user.getRole(), user.getFirstName(), user.getLastName(), user.getId());
    }
}
