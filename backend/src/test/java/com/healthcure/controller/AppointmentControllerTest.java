package com.healthcure.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcure.dto.AppointmentRequest;
import com.healthcure.model.Appointment;
import com.healthcure.model.Doctor;
import com.healthcure.model.Patient;
import com.healthcure.model.User;
import com.healthcure.repository.AppointmentRepository;
import com.healthcure.repository.DoctorRepository;
import com.healthcure.repository.PatientRepository;
import com.healthcure.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AppointmentControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    static class TestAppointmentRepository extends AppointmentRepository {
        public TestAppointmentRepository() {
            super(null);
        }

        @Override
        public Appointment save(Appointment appointment) {
            appointment.setId(101L);
            return appointment;
        }
    }

    static class TestUserRepository extends UserRepository {
        public TestUserRepository() {
            super(null);
        }

        @Override
        public Optional<User> findByEmail(String email) {
            return Optional.empty();
        }
    }

    static class TestPatientRepository extends PatientRepository {
        public TestPatientRepository() {
            super(null);
        }

        @Override
        public Optional<Patient> findByUserId(Long userId) {
            return Optional.empty();
        }
    }

    static class TestDoctorRepository extends DoctorRepository {
        public TestDoctorRepository() {
            super(null);
        }

        @Override
        public Optional<Doctor> findById(Long id) {
            return Optional.empty();
        }

        @Override
        public List<Doctor> findAll() {
            return Collections.emptyList();
        }
    }

    @BeforeEach
    void setUp() {
        AppointmentRepository repository = new TestAppointmentRepository();
        UserRepository userRepository = new TestUserRepository();
        PatientRepository patientRepository = new TestPatientRepository();
        DoctorRepository doctorRepository = new TestDoctorRepository();
        AppointmentController controller = new AppointmentController(repository, userRepository, patientRepository, doctorRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("GET /api/appointments/available-slots returns list of available slots and specialties")
    void testGetAvailableSlots() throws Exception {
        mockMvc.perform(get("/api/appointments/available-slots"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timeSlots").isArray())
                .andExpect(jsonPath("$.specialties").isArray())
                .andExpect(jsonPath("$.consultationTypes").isArray());
    }

    @Test
    @DisplayName("POST /api/appointments/book persists appointment and returns reference code")
    void testBookAppointmentSuccess() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setFullName("Sarah Jenkins");
        request.setEmail("sarah.jenkins@example.com");
        request.setPhone("+1-555-0199");
        request.setSpecialty("Cardiology");
        request.setConsultationType("In-Clinic Visit");
        request.setTimeSlot("Morning (09:00 - 12:00)");
        request.setPreferredDoctor("Dr. Michael Roberts");
        request.setNotes("Annual cardio consultation");
        request.setGoogleAuthenticated(false);

        mockMvc.perform(post("/api/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.patientName").value("Sarah Jenkins"))
                .andExpect(jsonPath("$.patientEmail").value("sarah.jenkins@example.com"))
                .andExpect(jsonPath("$.referenceCode").exists());
    }

    @Test
    @DisplayName("POST /api/appointments/book fails when required fields are missing")
    void testBookAppointmentValidationFailure() throws Exception {
        AppointmentRequest invalid = new AppointmentRequest();
        // Missing required full name, email, phone, etc.

        mockMvc.perform(post("/api/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }
}
