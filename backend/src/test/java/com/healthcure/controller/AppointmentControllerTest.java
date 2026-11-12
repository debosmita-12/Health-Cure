package com.healthcure.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcure.dto.AppointmentRequest;
import com.healthcure.model.Appointment;
import com.healthcure.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

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

    @BeforeEach
    void setUp() {
        AppointmentRepository repository = new TestAppointmentRepository();
        AppointmentController controller = new AppointmentController(repository, null, null, null);
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

        mockMvc.perform(post("/api/appointments/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }
}
