# Health & Cure — Modern Healthcare Platform

> **"Your health. Your records. One connected world."**  
> A patient-centric healthcare platform engineered for lifetime medical history consolidation, granular patient consent, and multi-portal clinical workflows.

---

## 🌟 Overview & Key Principles

Health & Cure unites fragmented clinical consultations, diagnostic test reports, and prescriptions into a single unified lifetime medical record owned and controlled directly by the patient.

1. **One Record**: Prescriptions, diagnostic reports, consultations, and medical history stay permanently attached to the patient.
2. **Consent-First Architecture**: Searching for a patient does not expose their clinical files. Access requires an explicit physician request and patient approval with granular time-based expiration.
3. **Three Role-Partitioned Portals**: 
   - **Patient Portal**: Review prescriptions, view medical timeline, approve/revoke doctor access requests, book appointments.
   - **Doctor Portal**: Request patient record access, author clinical consultations, upload diagnostic findings, issue digital prescriptions.
   - **Superadmin Portal**: Audit system logs, verify physician credentials, monitor platform security.

---

## 🎨 Design System & Reference Implementation

The user interface is faithfully styled after modern clinical design paradigms:

- **Primary Forest Green**: `#174C40` — headers, primary buttons, brand accents
- **Sage Mint**: `#5E8F7C` — secondary buttons, badges, decorative arcs
- **Soft Mint Background**: `#EEF8F3` / `#F4FAF7` — cards, badges, pill highlights
- **Typography**: Clean modern sans-serif typography with high legibility and contrast
- **Hero Section**: Responsive integrated tile pairing high-resolution clinical imagery with a floating frosted appointment booking card.
- **Service Cards**: 6 core specialty offerings (General Dentistry/Healthcare, Orthodontics, Dental Implants, Cosmetic Dentistry, Pediatric Care, Emergency Care).
- **Interactive Carousel**: Reception facility feature showcase with patient testimonial slider and keyboard/touch navigation.
- **Statistics Bar**: 4-point trust indicators with subtle vertical dividers.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS with CSS custom properties (Design Tokens)
- **Icons**: Handcrafted React SVG icon components (Zero third-party icon bloat)

### Backend
- **Framework**: Java 21+ / Spring Boot 3.3.5
- **Data Persistence**: **Spring JDBC** (`JdbcTemplate`) — *Strictly NO JPA, Hibernate, or Spring Data JPA*
- **Security**: Spring Security + Stateless JWT (`jjwt-api` 0.12.6) + BCrypt password hashing
- **Database**:
  - **PostgreSQL** (`jdbc:postgresql://localhost:5432/healthcure`)
  - **H2 in-memory fallback** (Zero-setup local development profile with PostgreSQL compatibility mode)
- **Schema**: Explicit DDL migrations via `classpath:schema.sql`

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** 18+ and **npm**
- **Java JDK** 21+
- **PostgreSQL** (optional; in-memory H2 profile activates automatically if PostgreSQL is unavailable)

### 1. Run the Frontend

```powershell
cd frontend
npm install
npm run dev -- --port 5173
```
Accessible at: **http://localhost:5173**

### 2. Run the Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
Accessible at: **http://localhost:8080**  
Health Check: **http://localhost:8080/api/health**

---

## 📡 REST API Reference

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health and database connectivity check |
| `POST` | `/api/appointments/book` | Submit an appointment booking request |
| `GET` | `/api/appointments/by-reference/{code}` | Retrieve appointment details by booking reference |
| `GET` | `/api/appointments/available-slots` | Fetch available consultation slots and specialties |
| `POST` | `/api/auth/register` | Register a new Patient or Doctor account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT bearer token |
| `POST` | `/api/auth/google` | OAuth 2.0 Google single sign-on |

### Authenticated Endpoints (Bearer Token)
| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patient/records` | `PATIENT` | List patient's medical records & prescriptions |
| `POST` | `/api/patient/consent/approve` | `PATIENT` | Approve physician access request |
| `POST` | `/api/patient/consent/revoke` | `PATIENT` | Immediately revoke doctor access |
| `POST` | `/api/doctor/access-requests` | `DOCTOR` | Submit record access request for a patient |
| `POST` | `/api/doctor/consultations` | `DOCTOR` | Record consultation notes and diagnosis |
| `GET` | `/api/admin/audit-logs` | `ADMIN` | Inspect full platform audit trails |
| `POST` | `/api/admin/verify-doctor` | `ADMIN` | Verify physician medical licence |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
