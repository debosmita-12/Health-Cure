import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import AppointmentCalendar from "../../components/common/AppointmentCalendar";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  DoctorIcon,
  HospitalIcon,
  LockIcon,
  PillIcon,
  PulseIcon,
  RecordsIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons/icons";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tab || "dashboard");
  const [sidebarFilter, setSidebarFilter] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modals & sub-form states
  const [newVital, setNewVital] = useState({ bp: "120/80", hr: "72", temp: "98.6", bmi: "22.5", glucose: "95" });
  const [newFeedback, setNewFeedback] = useState({ doctorId: 1, rating: 5, comment: "" });
  const [uploadDoc, setUploadDoc] = useState({ title: "", description: "", recordType: "LAB_REPORT" });
  const [profileForm, setProfileForm] = useState({ gender: "", bloodGroup: "", address: "", emergencyContact: "" });
  const [viewDiagnosisModalAppt, setViewDiagnosisModalAppt] = useState(null);
  const [selectedApptModal, setSelectedApptModal] = useState(null);

  // In-Portal Appointment Booking State
  const [departments, setDepartments] = useState([]);
  const [publicDoctors, setPublicDoctors] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    department: "General Medicine",
    specialty: "General Medicine",
    preferredDoctor: "First Available Specialist",
    doctorId: null,
    date: "",
    timeSlot: "Morning (09:00 - 12:00)",
    consultationType: "In-Clinic Visit",
    notes: "",
  });
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccessResult, setBookingSuccessResult] = useState(null);

  // Filter attending physicians strictly by selected clinical department
  const availableDoctorsForDepartment = useMemo(() => {
    if (!bookingForm.department) return publicDoctors;
    const target = bookingForm.department.trim().toLowerCase();
    const keyword = target.split("&")[0].trim();

    return publicDoctors.filter((d) => {
      const docDept = (d.department_name || "").trim().toLowerCase();
      const docSpec = (d.specialisation || "").trim().toLowerCase();
      return (
        docDept === target ||
        docSpec === target ||
        (docDept && docDept.includes(keyword)) ||
        (docSpec && docSpec.includes(keyword))
      );
    });
  }, [publicDoctors, bookingForm.department]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [dashRes, deptsRes, docsRes] = await Promise.allSettled([
        api.get("/api/patient/dashboard"),
        api.get("/api/public/departments"),
        api.get("/api/doctors/public"),
      ]);

      if (dashRes.status === "fulfilled") {
        setData(dashRes.value.data);
        if (dashRes.value.data?.patient) {
          setProfileForm({
            gender: dashRes.value.data.patient.gender || "",
            bloodGroup: dashRes.value.data.patient.bloodGroup || dashRes.value.data.patient.blood_group || "",
            address: dashRes.value.data.patient.address || "",
            emergencyContact: dashRes.value.data.patient.emergencyContact || "",
          });
        }
      } else {
        console.warn("Patient dashboard fetch error:", dashRes.reason);
      }
      if (deptsRes.status === "fulfilled" && Array.isArray(deptsRes.value.data)) {
        setDepartments(deptsRes.value.data);
      }
      if (docsRes.status === "fulfilled" && Array.isArray(docsRes.value.data)) {
        setPublicDoctors(docsRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load patient dashboard", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab.replace(/_/g, "-"));
    } else {
      setActiveTab("dashboard");
    }
  }, [tab]);

  async function handleBookAppointmentSubmit(e) {
    e.preventDefault();
    setBookingError("");
    setBookingSuccessResult(null);

    const activeDeptBooking = (appointments || []).find(
      (a) =>
        (a.specialty?.toLowerCase() === (bookingForm.specialty || bookingForm.department)?.toLowerCase()) &&
        !["CANCELLED", "COMPLETED", "ATTENDED", "NOT_ATTENDED"].includes(a.status?.toUpperCase())
    );
    if (activeDeptBooking) {
      setBookingError(
        `You already have an active appointment scheduled in ${bookingForm.department} (Reference: ${activeDeptBooking.referenceCode}). You can book appointments across different departments, but only one active appointment per department at a time.`
      );
      return;
    }

    if (!bookingForm.date) {
      setBookingError("Please select an appointment date.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (bookingForm.date < today) {
      setBookingError("Appointment date cannot be in the past.");
      return;
    }

    setIsBookingSubmitting(true);
    try {
      const payload = {
        fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Patient",
        email: user?.email || "",
        phone: user?.phone || profileForm.emergencyContact || "+91 9051579029",
        specialty: bookingForm.specialty || bookingForm.department,
        consultationType: bookingForm.consultationType,
        timeSlot: bookingForm.timeSlot,
        preferredDoctor: bookingForm.preferredDoctor,
        notes: bookingForm.notes,
        appointmentDate: bookingForm.date + "T09:00:00",
        googleAuthenticated: false,
      };

      const res = await api.post("/api/appointments/book", payload);
      setBookingSuccessResult(res.data);
      setActionMessage("Appointment successfully confirmed! Reference: " + res.data.referenceCode);
      if (res.data) {
        setData((prev) => ({
          ...(prev || {}),
          appointments: [res.data, ...(prev?.appointments || [])],
        }));
      }
      loadDashboard();
    } catch (err) {
      setBookingError(err.response?.data?.error || err.response?.data?.message || "Failed to confirm appointment. Please choose another date or slot.");
    } finally {
      setIsBookingSubmitting(false);
    }
  }

  async function handleConsent(requestId, approve) {
    setActionMessage("");
    setErrorMessage("");
    try {
      const endpoint = approve ? "/api/patient/consent/approve" : "/api/patient/consent/revoke";
      const res = await api.post(endpoint, { requestId });
      setActionMessage(res.data?.message || (approve ? "Access approved." : "Access revoked."));
      setData((prev) => ({
        ...(prev || {}),
        accessRequests: (prev?.accessRequests || []).map((r) =>
          r.id === requestId ? { ...r, status: approve ? "APPROVED" : "REVOKED" } : r
        ),
      }));
      loadDashboard();
    } catch (err) {
      setErrorMessage("Failed to update access consent.");
    }
  }

  async function handleRecordVitals(e) {
    e.preventDefault();
    setActionMessage("");
    try {
      await api.post("/api/patient/vitals", {
        bloodPressure: newVital.bp,
        heartRate: Number(newVital.hr),
        temperature: Number(newVital.temp),
        bmi: Number(newVital.bmi),
        bloodGlucose: Number(newVital.glucose),
      });
      setActionMessage("Vital signs logged successfully.");
      loadDashboard();
    } catch {
      setErrorMessage("Failed to record vitals.");
    }
  }

  async function handleBookLabTest(testId) {
    setActionMessage("");
    try {
      await api.post("/api/patient/lab-tests/book", { testId });
      setActionMessage("Diagnostic test request booked successfully.");
      loadDashboard();
    } catch {
      setErrorMessage("Failed to book lab test.");
    }
  }

  async function handlePayInvoice(invoiceId) {
    setActionMessage("");
    try {
      await api.post(`/api/patient/invoices/${invoiceId}/pay`);
      setActionMessage("Invoice paid successfully. Receipt archived in your medical vault.");
      loadDashboard();
    } catch {
      setErrorMessage("Payment failed. Please retry.");
    }
  }

  async function handleUploadRecord(e) {
    e.preventDefault();
    if (!uploadDoc.title) return;
    setActionMessage("");
    try {
      const res = await api.post("/api/patient/records/upload", uploadDoc);
      setActionMessage("Medical document securely encrypted and uploaded to your vault.");
      setUploadDoc({ title: "", description: "", recordType: "LAB_REPORT" });
      if (res.data) {
        setData((prev) => ({
          ...(prev || {}),
          records: [res.data, ...(prev?.records || [])],
        }));
      }
      loadDashboard();
    } catch {
      setErrorMessage("Failed to upload document.");
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setActionMessage("");
    try {
      const res = await api.put("/api/patient/profile", profileForm);
      setActionMessage("Profile details updated successfully.");
      if (res.data?.patient) {
        setData((prev) => ({
          ...(prev || {}),
          patient: { ...(prev?.patient || {}), ...res.data.patient },
        }));
      }
      loadDashboard();
    } catch {
      setErrorMessage("Failed to update profile.");
    }
  }

  async function handleSubmitFeedback(e) {
    e.preventDefault();
    setActionMessage("");
    try {
      await api.post("/api/patient/feedback", newFeedback);
      setActionMessage("Thank you for your feedback! Your review has been submitted.");
      setNewFeedback({ doctorId: 1, rating: 5, comment: "" });
    } catch {
      setErrorMessage("Failed to submit feedback.");
    }
  }

  function handleDownloadPrescription(rx) {
    const patientName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Patient";
    const docFirstName = rx.doctor_first_name || rx.doctorFirstName || "";
    const docLastName = rx.doctor_last_name || rx.doctorLastName || "";
    const docName = docFirstName ? `Dr. ${docFirstName} ${docLastName}`.trim() : "Attending Physician";
    const spec = rx.doctor_specialisation || rx.doctorSpecialisation || "General Medicine";
    const medName = rx.medicine_name || rx.medicineName || rx.title || "Prescription Regimen";
    const dateStr = rx.record_date || rx.recordDate ? new Date(rx.record_date || rx.recordDate).toLocaleDateString() : new Date().toLocaleDateString();

    const content = [
      "=================================================================",
      "               HEALTH & CURE - DIGITAL PRESCRIPTION              ",
      "=================================================================",
      `Date:              ${dateStr}`,
      `Patient Name:      ${patientName}`,
      `Prescribed By:     ${docName} (${spec})`,
      "Status:            ACTIVE / VERIFIED",
      "-----------------------------------------------------------------",
      "MEDICATION DETAILS:",
      `  Medicine:        ${medName}`,
      `  Dosage:          ${rx.dosage || "1 tablet"}`,
      `  Frequency:       ${rx.frequency || "Once daily"}`,
      `  Duration:        ${rx.duration || "7 days"}`,
      `  Instructions:    ${rx.notes || "Take as directed by physician."}`,
      "-----------------------------------------------------------------",
      "SECURITY & COMPLIANCE:",
      "This document is cryptographically verified and issued directly",
      "through the Health & Cure Electronic Health Records platform.",
      "=================================================================",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Prescription_${medName.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionMessage(`Downloaded official digital prescription for ${medName}.`);
  }

  function handleLogout() {
    logout();
  }

  if (loading && !data) {
    return (
      <section className="subpage">
        <div className="container" style={{ textAlign: "center", padding: "80px 20px" }}>
          <p>Loading your lifetime medical vault...</p>
        </div>
      </section>
    );
  }

  const patient = data?.patient || {};
  const records = data?.records || [];
  const prescriptions = data?.prescriptions || [];
  const consultations = data?.consultations || [];
  const appointments = data?.appointments || [];
  const accessRequests = data?.accessRequests || [];
  const vitals = data?.vitals || [];
  const invoices = data?.invoices || [];
  const labRequests = data?.labRequests || [];

  // 15 Standard Categories per Phase 4
  const menuCategories = [
    {
      title: "1. Main",
      items: [
        { id: "dashboard", label: "Dashboard", badge: null },
      ],
    },
    {
      title: "2. Appointments",
      items: [
        { id: "book-appointment", label: "Book Appointment", badge: "New" },
        { id: "my-appointments", label: "My Appointments", badge: appointments.length },
        { id: "appointment-history", label: "Appointment History", badge: null },
        { id: "calendar", label: "Calendar", badge: null },
      ],
    },
    {
      title: "3. Doctors",
      items: [
        { id: "find-doctor", label: "Find a Doctor", badge: null },
        { id: "specializations", label: "Browse Specializations", badge: null },
        { id: "doctor-profiles", label: "Doctor Profiles", badge: null },
        { id: "preferred-doctors", label: "My Preferred Doctors", badge: null },
      ],
    },
    {
      title: "4. Medical Records",
      items: [
        { id: "medical-history", label: "Medical History", badge: null },
        { id: "consultation-history", label: "Consultation History", badge: null },
        { id: "medical-documents", label: "Medical Documents", badge: records.length },
        { id: "lab-reports", label: "Lab Reports", badge: null },
        { id: "diagnostic-reports", label: "Diagnostic Reports", badge: null },
      ],
    },
    {
      title: "5. Prescriptions",
      items: [
        { id: "my-prescriptions", label: "My Prescriptions", badge: null },
        { id: "prescription-history", label: "Prescription History", badge: null },
        { id: "download-prescriptions", label: "Download Prescriptions", badge: null },
      ],
    },
    {
      title: "6. Health & Wellness",
      items: [
        { id: "health-overview", label: "Health Overview", badge: null },
        { id: "health-metrics", label: "Health Metrics", badge: vitals.length },
        { id: "bmi-tracker", label: "BMI Tracker", badge: null },
        { id: "health-goals", label: "Health Goals", badge: null },
        { id: "health-notes", label: "Health Notes", badge: null },
      ],
    },
    {
      title: "7. Laboratory & Diagnostics",
      items: [
        { id: "available-tests", label: "Available Tests", badge: "Catalog" },
        { id: "book-lab-tests", label: "Book Lab Tests", badge: null },
        { id: "my-test-bookings", label: "My Test Bookings", badge: labRequests.length },
        { id: "test-results", label: "Test Results", badge: null },
      ],
    },
    {
      title: "8. Payments & Billing",
      items: [
        { id: "my-bills", label: "My Bills", badge: invoices.filter(i => i.status !== "PAID").length || null },
        { id: "payment-history", label: "Payment History", badge: null },
        { id: "invoices", label: "Invoices", badge: invoices.length },
        { id: "receipts", label: "Receipts", badge: null },
        { id: "refund-status", label: "Refund Status", badge: null },
      ],
    },
    {
      title: "9. Family & Dependents",
      items: [
        { id: "family-members", label: "Family Members", badge: null },
        { id: "add-dependent", label: "Add Dependent", badge: null },
        { id: "family-appointments", label: "Family Appointments", badge: null },
        { id: "authorized-records", label: "Authorized Medical Records", badge: null },
      ],
    },
    {
      title: "10. Follow-ups",
      items: [
        { id: "upcoming-followups", label: "Upcoming Follow-ups", badge: null },
        { id: "followup-history", label: "Follow-up History", badge: null },
        { id: "medical-reminders", label: "Medical Reminders", badge: null },
      ],
    },
    {
      title: "11. Telemedicine",
      items: [
        { id: "online-consultations", label: "Online Consultations", badge: null },
        { id: "tele-history", label: "Consultation History", badge: null },
      ],
    },
    {
      title: "12. Communication",
      items: [
        { id: "messages", label: "Messages", badge: null },
        { id: "notifications", label: "Notifications", badge: "Active" },
        { id: "contact-centre", label: "Contact Healthcare Centre", badge: null },
      ],
    },
    {
      title: "13. Feedback & Support",
      items: [
        { id: "doctor-reviews", label: "Doctor Reviews", badge: null },
        { id: "submit-feedback", label: "Submit Feedback", badge: null },
        { id: "complaints", label: "Complaints", badge: null },
        { id: "help-support", label: "Help & Support", badge: null },
      ],
    },
    {
      title: "14. My Account",
      items: [
        { id: "my-profile", label: "My Profile", badge: null },
        { id: "personal-info", label: "Personal Information", badge: null },
        { id: "privacy-consent", label: "Privacy & Consent", badge: accessRequests.length },
        { id: "security-settings", label: "Security Settings", badge: null },
      ],
    },
    {
      title: "15. Exit",
      items: [
        { id: "logout", label: "Logout", badge: null },
      ],
    },
  ];

  return (
    <section className="subpage patient-dashboard" style={{ paddingTop: "20px" }}>
      <div className="container" style={{ maxWidth: "1440px" }}>
        {/* Full-Height Layout: Dark Green Sidebar on the Left starting from the Top */}
        <div className="portal-grid-layout" style={{ marginTop: 0 }}>
          {/* Left Sidebar Column */}
          <div className="portal-sidebar-column">
            <aside className="portal-sidebar-card dark-green-sidebar">
              <div className="portal-user-profile-box">
                <div className="portal-user-avatar">
                  {(user?.firstName || "P")[0].toUpperCase()}
                </div>
                <div className="portal-user-info">
                  <h4 className="portal-user-name">{user?.firstName} {user?.lastName}</h4>
                  <span className="portal-user-role-badge">PATIENT</span>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="portal-search-input"
                  placeholder="Search portal menu..."
                  value={sidebarFilter}
                  onChange={(e) => setSidebarFilter(e.target.value)}
                />
              </div>

              <nav aria-label="Patient portal navigation">
                {menuCategories.map((group) => {
                  const filteredItems = group.items.filter(item =>
                    item.label.toLowerCase().includes(sidebarFilter.toLowerCase())
                  );
                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={group.title} style={{ marginBottom: "10px" }}>
                      <p className="portal-nav-group-title">{group.title}</p>
                      <ul className="portal-nav-list">
                        {filteredItems.map((item) => {
                          const isActive = activeTab === item.id;
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                className={`portal-nav-btn ${isActive ? "active" : ""}`}
                                onClick={() => {
                                  if (item.id === "logout") {
                                    handleLogout();
                                  } else if (item.id === "book-appointment") {
                                    setActiveTab("book-appointment");
                                    navigate("/patient/book-appointment", { preventScrollReset: true });
                                  } else {
                                    setActiveTab(item.id);
                                    navigate(`/patient/${item.id}`, { preventScrollReset: true });
                                  }
                                }}
                              >
                                <span className="portal-nav-btn-content">
                                  {item.label}
                                </span>
                                {item.badge !== null && item.badge !== undefined && (
                                  <span className="portal-nav-badge">{item.badge}</span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </nav>
            </aside>
          </div>

          {/* Right Main Column: Banner, Stats & Content */}
          <div className="portal-main-column" style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Executive Clinical Portal Dashboard Banner in exact Register Button Green (#174C40) */}
            <div className="portal-hero-banner" style={{ margin: 0 }}>
              <div>
                <p className="portal-hero-eyebrow">
                  <ShieldIcon size={16} />
                  Centralized Patient Vault &amp; Healthcare Portal
                </p>
                <h1 className="portal-hero-title">
                  Welcome, <span>{user?.firstName || "Patient"} {user?.lastName || ""}</span>
                </h1>
                <p className="portal-hero-lede">
                  Lifetime encrypted health records, diagnostic tests, verified consultations, and patient consent governance.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <span className="portal-hero-badge">
                  <strong>Patient ID:</strong> PAT-{patient.id || user?.patientId || user?.id || "001"}
                </span>
                <span className="portal-hero-badge" style={{ background: "rgba(52, 211, 153, 0.25)", borderColor: "#34D399" }}>
                  <CheckIcon size={14} /> Active Care Member
                </span>
              </div>
            </div>

            {/* Global Notifications */}
            {actionMessage && (
              <div className="form-success-card" style={{ margin: 0, padding: "14px 20px" }}>
                <p><strong>Success:</strong> {actionMessage}</p>
              </div>
            )}
            {errorMessage && (
              <div className="form-error-alert" style={{ margin: 0 }}>
                <p><strong>Notice:</strong> {errorMessage}</p>
              </div>
            )}

            {/* Quick Stats Bar */}
            <div className="stats-bar-card" style={{ margin: 0, padding: "18px 24px" }}>
              <div className="stats-item">
                <span className="stats-icon"><UsersIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">
                    {patient.gender || user?.gender || profileForm.gender || "Female"} ({patient.bloodGroup || patient.blood_group || user?.bloodGroup || profileForm.bloodGroup || "A+"})
                  </strong>
                  <span className="stats-label">Demographics</span>
                </div>
                <span className="stats-divider" aria-hidden="true" />
              </div>

              <div className="stats-item">
                <span className="stats-icon"><CalendarIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">{appointments.length} Consultations</strong>
                  <span className="stats-label">Scheduled Visits</span>
                </div>
                <span className="stats-divider" aria-hidden="true" />
              </div>

              <div className="stats-item">
                <span className="stats-icon"><RecordsIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">{records.length} Records</strong>
                  <span className="stats-label">Encrypted Files</span>
                </div>
                <span className="stats-divider" aria-hidden="true" />
              </div>

              <div className="stats-item">
                <span className="stats-icon"><ShieldIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">{accessRequests.filter(r => r.status === "APPROVED").length} Approved</strong>
                  <span className="stats-label">Doctor Consents</span>
                </div>
              </div>
            </div>

            {/* Right Main Content Area */}
            <main className="portal-content-area">
            {/* View: Dashboard Overview */}
            {activeTab === "dashboard" && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header">
                    <div>
                      <h2 style={{ margin: "0 0 6px", color: "var(--color-primary)" }}>Patient Health Summary</h2>
                      <p style={{ margin: 0, color: "var(--color-text-body)" }}>
                        Access your active medical records, appointments, and diagnostic results in one place.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActiveTab("book-appointment"); navigate("/patient/book-appointment"); }}
                      className="btn btn-primary"
                    >
                      Book Appointment <ArrowRightIcon size={14} />
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" }}>
                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Upcoming Visit</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>
                        {appointments.length > 0 ? appointments[0].specialty : "None scheduled"}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>
                        {appointments.length > 0 ? appointments[0].timeSlot : "Book anytime"}
                      </p>
                    </div>

                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Latest Blood Pressure</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>
                        {vitals.length > 0 && vitals[0].blood_pressure ? vitals[0].blood_pressure : "120/80 mmHg"}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>Normal Range</p>
                    </div>

                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Outstanding Invoices</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>
                        {invoices.filter(i => i.status !== "PAID").length} Pending
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>
                        {invoices.filter(i => i.status !== "PAID").length === 0 ? "All settled" : "Due for review"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Appointments Card */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header">
                    <div>
                      <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Scheduled Appointments</h3>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                        Upcoming consultations, attendance statuses, and clinical diagnoses.
                      </p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab("my-appointments"); navigate("/patient/my-appointments"); }}>
                      View All
                    </button>
                  </div>
                  {appointments.length === 0 ? (
                    <p style={{ color: "var(--color-text-body)", margin: 0 }}>No consultations scheduled yet.</p>
                  ) : (
                    <div className="portal-table-wrap">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Specialty</th>
                            <th>Doctor</th>
                            <th>Slot</th>
                            <th>Status / Attendance</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.slice(0, 4).map((a) => {
                            const isAttended = a.status === "ATTENDED";
                            const isMissed = a.status === "NOT_ATTENDED";
                            return (
                              <tr key={a.id}>
                                <td>
                                  <strong>{a.specialty}</strong>
                                  <br />
                                  <code>{a.referenceCode}</code>
                                </td>
                                <td>{a.preferredDoctor || "Assigned Physician"}</td>
                                <td>{a.timeSlot}</td>
                                <td>
                                  <span
                                    className="status-badge-pill"
                                    style={{
                                      background: isAttended ? "#ECFDF5" : isMissed ? "#FEF2F2" : a.status === "CONFIRMED" ? "#EFF6FF" : "#FFFBEB",
                                      color: isAttended ? "#065F46" : isMissed ? "#991B1B" : a.status === "CONFIRMED" ? "#1E40AF" : "#92400E",
                                      border: `1px solid ${isAttended ? "#10B981" : isMissed ? "#EF4444" : a.status === "CONFIRMED" ? "#3B82F6" : "#F59E0B"}`,
                                      fontWeight: 700,
                                      padding: "4px 10px",
                                      borderRadius: "12px",
                                      display: "inline-block",
                                    }}
                                  >
                                    {isAttended ? "✓ Attended" : isMissed ? "✗ Missed" : a.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                      onClick={() => setSelectedApptModal(a)}
                                    >
                                      👁 Details
                                    </button>
                                    {a.diagnosisTitle && (
                                      <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        style={{ padding: "4px 8px", fontSize: "0.8rem", background: "#059669", borderColor: "#059669" }}
                                        onClick={() => setViewDiagnosisModalAppt(a)}
                                      >
                                        📋 View Rx
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View: Book Appointment (In-Portal Patient Workflow) */}
            {activeTab === "book-appointment" && (
              <div className="panel-form-card" style={{ padding: "32px" }}>
                <div className="portal-card-header" style={{ marginBottom: "24px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 6px", color: "var(--color-primary)", fontSize: "1.4rem" }}>
                      Schedule a Medical Appointment
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-text-body)" }}>
                      Select clinical department, attending physician, and preferred consultation slot. Patient credentials auto-populate from your profile.
                    </p>
                  </div>
                </div>

                {bookingSuccessResult ? (
                  <div style={{ background: "#EEF8F3", border: "2px solid #34D399", borderRadius: "16px", padding: "32px", textAlign: "center" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#D1FAE5", color: "#065F46", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <CheckIcon size={30} />
                    </div>
                    <h3 style={{ color: "var(--color-primary)", marginBottom: "8px", fontSize: "1.3rem" }}>Appointment Confirmed!</h3>
                    <p style={{ color: "var(--color-text-body)", maxWidth: "520px", margin: "0 auto 16px", lineHeight: 1.5 }}>
                      Your consultation request has been successfully registered and synchronized with the Doctor Clinical Workspace and Platform Schedules.
                    </p>
                    <div style={{ background: "#FFFFFF", padding: "16px 28px", borderRadius: "12px", display: "inline-block", border: "1px solid var(--color-border-subtle)", marginBottom: "24px" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", display: "block" }}>Booking Reference Code</span>
                      <code style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-primary)" }}>{bookingSuccessResult.referenceCode}</code>
                    </div>
                    <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setActiveTab("my-appointments");
                          navigate("/patient/my-appointments");
                          setBookingSuccessResult(null);
                        }}
                      >
                        View My Appointments →
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setBookingSuccessResult(null);
                        }}
                      >
                        Book Another Appointment
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookAppointmentSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {bookingError && (
                      <div style={{ background: "#FEE2E2", border: "1px solid #EF4444", color: "#991B1B", padding: "12px 16px", borderRadius: "10px", fontSize: "0.9rem" }}>
                        {bookingError}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                          Clinical Department *
                        </label>
                        <select
                          value={bookingForm.department}
                          onChange={(e) => {
                            const dept = e.target.value;
                            setBookingForm((prev) => ({
                              ...prev,
                              department: dept,
                              specialty: dept,
                              preferredDoctor: "First Available Specialist",
                              doctorId: null,
                            }));
                          }}
                          style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem", background: "#FFFFFF" }}
                        >
                          {departments.length > 0 ? (
                            departments.map((d) => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))
                          ) : (
                            <>
                              <option value="Cardiology & Vascular">Cardiology &amp; Vascular</option>
                              <option value="Dermatology & Skin Health">Dermatology &amp; Skin Health</option>
                              <option value="General Medicine">General Medicine</option>
                              <option value="Gynecology & Women's Health">Gynecology &amp; Women's Health</option>
                              <option value="Neurology & Brain Sciences">Neurology &amp; Brain Sciences</option>
                              <option value="Oncology & Cancer Care">Oncology &amp; Cancer Care</option>
                              <option value="Ophthalmology & Vision Care">Ophthalmology &amp; Vision Care</option>
                              <option value="Orthopedics & Joint">Orthopedics &amp; Joint</option>
                              <option value="Pediatrics & Family Care">Pediatrics &amp; Family Care</option>
                              <option value="Psychiatry & Mental Health">Psychiatry &amp; Mental Health</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                          Attending Physician *
                        </label>
                        <select
                          value={bookingForm.preferredDoctor}
                          onChange={(e) => {
                            const docName = e.target.value;
                            const match = availableDoctorsForDepartment.find((d) => `Dr. ${d.first_name} ${d.last_name}` === docName);
                            setBookingForm((prev) => ({
                              ...prev,
                              preferredDoctor: docName,
                              doctorId: match ? match.doctor_id : null,
                            }));
                          }}
                          style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem", background: "#FFFFFF" }}
                        >
                          <option value="First Available Specialist">
                            First Available Verified Doctor ({bookingForm.department || "Specialist"})
                          </option>
                          {availableDoctorsForDepartment.map((d) => (
                            <option key={d.doctor_id} value={`Dr. ${d.first_name} ${d.last_name}`}>
                              Dr. {d.first_name} {d.last_name} ({d.specialisation || d.department_name}) - Fee: ₹{d.consultation_fee ? Number(d.consultation_fee).toFixed(0) : "750"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                          Appointment Date *
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                          Preferred Time Slot *
                        </label>
                        <select
                          value={bookingForm.timeSlot}
                          onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                          style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem", background: "#FFFFFF" }}
                        >
                          <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                          <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                          <option value="Evening (16:00 - 19:00)">Evening (16:00 - 19:00)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                          Consultation Mode *
                        </label>
                        <select
                          value={bookingForm.consultationType}
                          onChange={(e) => setBookingForm({ ...bookingForm, consultationType: e.target.value })}
                          style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem", background: "#FFFFFF" }}
                        >
                          <option value="In-Clinic Visit">In-Clinic Visit</option>
                          <option value="Video Consultation">Video Consultation</option>
                          <option value="Diagnostic Records Review">Diagnostic Records Review</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto-populated Patient Credentials */}
                    <div style={{ background: "var(--color-bg-tint)", padding: "18px 20px", borderRadius: "12px", border: "1px solid var(--color-border-card)" }}>
                      <h4 style={{ margin: "0 0 10px", color: "var(--color-primary)", fontSize: "0.92rem" }}>
                        Patient Credentials (Auto-Populated from Active Profile)
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", fontSize: "0.88rem" }}>
                        <div>
                          <span style={{ color: "var(--color-text-muted)", display: "block" }}>Full Name:</span>
                          <strong>{user?.firstName} {user?.lastName}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--color-text-muted)", display: "block" }}>Account Email:</span>
                          <strong>{user?.email}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--color-text-muted)", display: "block" }}>Contact Phone:</span>
                          <strong>{user?.phone || profileForm.emergencyContact || "On File"}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                        Reason for Visit / Clinical Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Briefly describe your symptoms or reason for scheduling..."
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem" }}
                      />
                    </div>

                    {/* Active Department Restriction Warning */}
                    {(() => {
                      const activeDeptAppt = (appointments || []).find(
                        (a) =>
                          (a.specialty?.toLowerCase() === (bookingForm.specialty || bookingForm.department)?.toLowerCase()) &&
                          !["CANCELLED", "COMPLETED", "ATTENDED", "NOT_ATTENDED"].includes(a.status?.toUpperCase())
                      );
                      if (!activeDeptAppt) return null;
                      return (
                        <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", color: "#92400E", padding: "14px 18px", borderRadius: "12px", fontSize: "0.9rem", lineHeight: 1.5 }}>
                          <strong>⚠️ Department Booking Policy:</strong> You already have an active appointment scheduled in the <strong>{bookingForm.department}</strong> department (Reference: <code>{activeDeptAppt.referenceCode}</code>, Time: {activeDeptAppt.timeSlot}). To ensure clinical care coordination, patients can book multiple appointments across different medical departments, but only one active appointment per department at a time.
                        </div>
                      );
                    })()}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setActiveTab("dashboard")}
                      >
                        Cancel
                      </button>
                      {(() => {
                        const activeDeptAppt = (appointments || []).find(
                          (a) =>
                            (a.specialty?.toLowerCase() === (bookingForm.specialty || bookingForm.department)?.toLowerCase()) &&
                            !["CANCELLED", "COMPLETED", "ATTENDED", "NOT_ATTENDED"].includes(a.status?.toUpperCase())
                        );
                        return (
                          <button
                            type="submit"
                            disabled={isBookingSubmitting || Boolean(activeDeptAppt)}
                            className="btn btn-primary"
                            style={{
                              padding: "12px 28px",
                              opacity: activeDeptAppt ? 0.6 : 1,
                              cursor: activeDeptAppt ? "not-allowed" : "pointer",
                            }}
                          >
                            {activeDeptAppt
                              ? "Already Booked in this Department"
                              : isBookingSubmitting
                              ? "Confirming Booking..."
                              : "Confirm & Schedule Appointment \u2192"}
                          </button>
                        );
                      })()}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* View: My Appointments */}
            {(activeTab === "my-appointments" || activeTab === "appointment-history") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <div className="portal-card-header">
                  <div>
                    <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>
                      {activeTab === "my-appointments" ? "My Appointments" : "Appointment History"}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                      Track attendance statuses, timing, consultation modes, and clinical diagnoses.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveTab("book-appointment"); navigate("/patient/book-appointment"); }}
                    className="btn btn-primary"
                  >
                    Book New Appointment
                  </button>
                </div>
                {appointments.length === 0 ? (
                  <p>No appointments recorded.</p>
                ) : (
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Specialty</th>
                          <th>Doctor</th>
                          <th>Type</th>
                          <th>Slot</th>
                          <th>Attendance / Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => {
                          const isAttended = a.status === "ATTENDED";
                          const isMissed = a.status === "NOT_ATTENDED";
                          return (
                            <tr key={a.id}>
                              <td><code>{a.referenceCode}</code></td>
                              <td><strong>{a.specialty}</strong></td>
                              <td>{a.preferredDoctor || "Assigned"}</td>
                              <td>{a.consultationType}</td>
                              <td>{a.timeSlot}</td>
                              <td>
                                <span
                                  className="status-badge-pill"
                                  style={{
                                    background: isAttended ? "#ECFDF5" : isMissed ? "#FEF2F2" : a.status === "CONFIRMED" ? "#EFF6FF" : "#FFFBEB",
                                    color: isAttended ? "#065F46" : isMissed ? "#991B1B" : a.status === "CONFIRMED" ? "#1E40AF" : "#92400E",
                                    border: `1px solid ${isAttended ? "#10B981" : isMissed ? "#EF4444" : a.status === "CONFIRMED" ? "#3B82F6" : "#F59E0B"}`,
                                    fontWeight: 700,
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    display: "inline-block",
                                  }}
                                >
                                  {isAttended ? "✓ Attended & Completed" : isMissed ? "✗ Missed / Not Attended" : a.status}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                    onClick={() => setSelectedApptModal(a)}
                                  >
                                    👁 Details
                                  </button>
                                  {a.diagnosisTitle && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      style={{ padding: "4px 8px", fontSize: "0.8rem", background: "#059669", borderColor: "#059669" }}
                                      onClick={() => setViewDiagnosisModalAppt(a)}
                                    >
                                      📋 View Diagnosis &amp; Rx
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View: Calendar (Dynamic 3-Month Appointment Calendar) */}
            {activeTab === "calendar" && (
              <AppointmentCalendar
                appointments={appointments}
                onSelectDate={(dateStr) => {
                  setBookingForm((prev) => ({
                    ...prev,
                    date: dateStr,
                  }));
                  setActiveTab("book-appointment");
                  navigate("/patient/book-appointment");
                }}
              />
            )}

            {/* View: Doctors / Discovery */}
            {(activeTab === "find-doctor" || activeTab === "specializations" || activeTab === "doctor-profiles" || activeTab === "preferred-doctors") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Our Registered Physicians</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Browse accredited healthcare specialists available for in-clinic visits and telemedicine consultations.
                </p>
                <div style={{ display: "grid", gap: "16px" }}>
                  {publicDoctors.length === 0 ? (
                    <div className="service-card-item" style={{ padding: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
                      <div className="service-card-icon-wrap"><DoctorIcon size={28} /></div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Dr. Rajesh Sharma</h4>
                        <p style={{ margin: "0 0 6px", fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                          Cardiology &amp; Vascular • MBBS, MD, DM (AIIMS New Delhi) (16 years exp)
                        </p>
                        <span style={{ fontSize: "0.85rem", color: "var(--color-sage)", fontWeight: 700 }}>
                          Fee: ₹750.00 • In-Clinic &amp; Telemedicine
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingForm((prev) => ({
                            ...prev,
                            preferredDoctor: "Dr. Rajesh Sharma",
                            specialty: "Cardiology & Vascular",
                          }));
                          setActiveTab("book-appointment");
                          navigate("/patient/book-appointment");
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Book Consultation
                      </button>
                    </div>
                  ) : (
                    publicDoctors.map((doc) => (
                      <div key={doc.doctor_id} className="service-card-item" style={{ padding: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
                        <div className="service-card-icon-wrap"><DoctorIcon size={28} /></div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>
                            Dr. {doc.first_name} {doc.last_name}
                          </h4>
                          <p style={{ margin: "0 0 6px", fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                            {doc.specialisation || "General Specialist"} • {doc.qualification || "MBBS, MD"} ({doc.experience_years} years exp) • {doc.department_name || "Clinical Care"}
                          </p>
                          <span style={{ fontSize: "0.85rem", color: "var(--color-sage)", fontWeight: 700 }}>
                            Fee: ₹{doc.consultation_fee ? Number(doc.consultation_fee).toFixed(0) : "750"} • {doc.is_available ? "Available" : "Offline"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBookingForm((prev) => ({
                              ...prev,
                              preferredDoctor: `Dr. ${doc.first_name} ${doc.last_name}`,
                              doctorId: doc.doctor_id,
                              specialty: doc.specialisation || prev.specialty,
                              department: doc.department_name || prev.department,
                            }));
                            setActiveTab("book-appointment");
                            navigate("/patient/book-appointment");
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Book Consultation
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* View: Medical Records */}
            {(activeTab === "medical-history" || activeTab === "consultation-history" || activeTab === "medical-documents" || activeTab === "lab-reports" || activeTab === "diagnostic-reports") && (
              <div style={{ display: "grid", gap: "24px" }}>
                {/* Clinical Consultations List */}
                {consultations.length > 0 && (
                  <div className="panel-form-card" style={{ padding: "28px" }}>
                    <div className="portal-card-header" style={{ marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Clinical Consultations &amp; Summaries</h3>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                          Physician examination notes, clinical diagnoses, and post-visit treatment instructions.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: "14px" }}>
                      {consultations.map((c, idx) => {
                        const docFirstName = c.doctor_first_name || c.doctorFirstName || "";
                        const docLastName = c.doctor_last_name || c.doctorLastName || "";
                        const docName = docFirstName ? `Dr. ${docFirstName} ${docLastName}`.trim() : "Attending Physician";
                        const spec = c.doctor_specialisation || c.doctorSpecialisation || "General Medicine";
                        const dateStr = c.record_date || c.recordDate ? new Date(c.record_date || c.recordDate).toLocaleDateString() : "";

                        return (
                          <div key={c.id || idx} style={{ padding: "18px 20px", border: "1px solid var(--color-border-card)", borderRadius: "var(--radius-md)", background: "var(--color-bg-tint)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                              <div>
                                <h4 style={{ margin: "0 0 2px", color: "var(--color-primary)" }}>{c.diagnosis || c.title || "Clinical Consultation"}</h4>
                                <span style={{ fontSize: "0.85rem", color: "var(--color-sage)" }}>
                                  Conducted by {docName} ({spec}) {dateStr && `• ${dateStr}`}
                                </span>
                              </div>
                              <span className="status-badge-pill status-confirmed">Signed Clinical Note</span>
                            </div>
                            {c.symptoms && (
                              <p style={{ margin: "6px 0", fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                                <strong>Chief Symptoms:</strong> {c.symptoms}
                              </p>
                            )}
                            {(c.treatment_plan || c.description) && (
                              <p style={{ margin: "6px 0", fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                                <strong>Treatment Plan:</strong> {c.treatment_plan || c.description}
                              </p>
                            )}
                            {c.follow_up_notes && (
                              <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--color-sage)" }}>
                                <em>Follow-up: {c.follow_up_notes}</em>
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header">
                    <div>
                      <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Verified Medical Documents</h3>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                        Your lifetime medical vault records are protected by 256-bit encryption.
                      </p>
                    </div>
                  </div>

                  {records.length === 0 ? (
                    <p style={{ color: "var(--color-text-body)" }}>No clinical records uploaded yet.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                      {records.map((r) => (
                        <div key={r.id} style={{ padding: "16px 20px", border: "1px solid var(--color-border-card)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <h4 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>{r.title}</h4>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>{r.description}</p>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-sage)" }}>Type: {r.recordType}</span>
                          </div>
                          <span className="status-badge-pill status-confirmed">Vault Verified</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Document Box */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Upload Medical Document</h3>
                  <form onSubmit={handleUploadRecord} style={{ display: "grid", gap: "14px" }}>
                    <label>
                      Document Title *
                      <input
                        type="text"
                        required
                        placeholder="e.g. Previous Blood Panel, ECG Report"
                        value={uploadDoc.title}
                        onChange={(e) => setUploadDoc({ ...uploadDoc, title: e.target.value })}
                      />
                    </label>
                    <label>
                      Category
                      <select
                        value={uploadDoc.recordType}
                        onChange={(e) => setUploadDoc({ ...uploadDoc, recordType: e.target.value })}
                      >
                        <option value="LAB_REPORT">Laboratory Report</option>
                        <option value="PRESCRIPTION">Prescription Record</option>
                        <option value="CONSULTATION">Consultation Summary</option>
                        <option value="DIAGNOSTIC">Diagnostic Imaging</option>
                      </select>
                    </label>
                    <label>
                      Clinical Description / Notes
                      <textarea
                        rows={2}
                        placeholder="Provide details about this document..."
                        value={uploadDoc.description}
                        onChange={(e) => setUploadDoc({ ...uploadDoc, description: e.target.value })}
                      />
                    </label>
                    <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                      Upload to Secure Vault
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* View: Prescriptions */}
            {(activeTab === "my-prescriptions" || activeTab === "prescription-history" || activeTab === "download-prescriptions") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <div className="portal-card-header" style={{ marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Digital Prescriptions</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                      Official prescriptions issued by verified physicians with dosage, refill instructions, and download links.
                    </p>
                  </div>
                </div>

                {prescriptions.length === 0 ? (
                  <div style={{ padding: "24px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)", border: "1px dashed var(--color-border-card)", textAlign: "center" }}>
                    <p style={{ margin: "0 0 8px", fontWeight: "600", color: "var(--color-primary)" }}>No Active Prescriptions Issued Yet</p>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                      When your attending physician prescribes medications during your consultation, they will appear here automatically for review and download.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "16px" }}>
                    {prescriptions.map((p, idx) => {
                      const docFirstName = p.doctor_first_name || p.doctorFirstName || "";
                      const docLastName = p.doctor_last_name || p.doctorLastName || "";
                      const docName = docFirstName ? `Dr. ${docFirstName} ${docLastName}`.trim() : "Attending Physician";
                      const spec = p.doctor_specialisation || p.doctorSpecialisation || "General Medicine";
                      const medName = p.medicine_name || p.medicineName || p.title || "Prescription Regimen";
                      const dateStr = p.record_date || p.recordDate ? new Date(p.record_date || p.recordDate).toLocaleDateString() : "Active";

                      return (
                        <div key={p.id || idx} style={{ padding: "20px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-card)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                            <div>
                              <h4 style={{ margin: "0 0 2px", color: "var(--color-primary)" }}>{medName}</h4>
                              <span style={{ fontSize: "0.85rem", color: "var(--color-sage)" }}>
                                Prescribed by {docName} ({spec}) • {dateStr}
                              </span>
                            </div>
                            <span className="status-badge-pill status-confirmed">Valid &amp; Active</span>
                          </div>
                          <div style={{ margin: "12px 0 14px", padding: "12px 16px", background: "#fff", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-card)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", fontSize: "0.88rem" }}>
                              <div>
                                <span style={{ color: "var(--color-sage)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Dosage</span>
                                <strong>{p.dosage || "1 tablet"}</strong>
                              </div>
                              <div>
                                <span style={{ color: "var(--color-sage)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Frequency</span>
                                <strong>{p.frequency || "Once daily"}</strong>
                              </div>
                              <div>
                                <span style={{ color: "var(--color-sage)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Duration</span>
                                <strong>{p.duration || "7 days"}</strong>
                              </div>
                              {p.notes && (
                                <div style={{ gridColumn: "1 / -1" }}>
                                  <span style={{ color: "var(--color-sage)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Instructions</span>
                                  <span>{p.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadPrescription(p)}>
                            Download Prescription
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* View: Health & Wellness (Vitals) */}
            {(activeTab === "health-overview" || activeTab === "health-metrics" || activeTab === "bmi-tracker" || activeTab === "health-goals" || activeTab === "health-notes") && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Log Health Vitals</h3>
                  <form onSubmit={handleRecordVitals} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px" }}>
                    <label>
                      Blood Pressure
                      <input
                        type="text"
                        value={newVital.bp}
                        onChange={(e) => setNewVital({ ...newVital, bp: e.target.value })}
                        placeholder="120/80"
                      />
                    </label>
                    <label>
                      Heart Rate (BPM)
                      <input
                        type="number"
                        value={newVital.hr}
                        onChange={(e) => setNewVital({ ...newVital, hr: e.target.value })}
                        placeholder="72"
                      />
                    </label>
                    <label>
                      Temp (°F)
                      <input
                        type="text"
                        value={newVital.temp}
                        onChange={(e) => setNewVital({ ...newVital, temp: e.target.value })}
                        placeholder="98.6"
                      />
                    </label>
                    <label>
                      BMI Index
                      <input
                        type="text"
                        value={newVital.bmi}
                        onChange={(e) => setNewVital({ ...newVital, bmi: e.target.value })}
                        placeholder="22.5"
                      />
                    </label>
                    <label>
                      Blood Glucose
                      <input
                        type="number"
                        value={newVital.glucose}
                        onChange={(e) => setNewVital({ ...newVital, glucose: e.target.value })}
                        placeholder="95"
                      />
                    </label>
                    <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                      <button type="submit" className="btn btn-primary">
                        Save Health Reading
                      </button>
                    </div>
                  </form>
                </div>

                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Vital Sign History</h3>
                  {vitals.length === 0 ? (
                    <p>No vitals logged yet.</p>
                  ) : (
                    <div className="portal-table-wrap">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Recorded On</th>
                            <th>BP</th>
                            <th>Heart Rate</th>
                            <th>Temp</th>
                            <th>BMI</th>
                            <th>Glucose</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vitals.map((v) => (
                            <tr key={v.id}>
                              <td>{v.measured_at ? new Date(v.measured_at).toLocaleDateString() : "Recent"}</td>
                              <td><strong>{v.blood_pressure}</strong></td>
                              <td>{v.heart_rate} bpm</td>
                              <td>{v.temperature}°F</td>
                              <td>{v.bmi}</td>
                              <td>{v.blood_glucose} mg/dL</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View: Laboratory & Diagnostics */}
            {(activeTab === "available-tests" || activeTab === "book-lab-tests" || activeTab === "my-test-bookings" || activeTab === "test-results") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Diagnostic &amp; Lab Catalog</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Order verified laboratory tests with rapid turnaround and direct vault integration.
                </p>
                <div style={{ display: "grid", gap: "16px" }}>
                  {[
                    { id: 1, name: "Complete Blood Count (CBC)", cat: "Hematology", fee: "₹250.00", prep: "No fasting strictly required." },
                    { id: 2, name: "Comprehensive Metabolic Panel (CMP)", cat: "Biochemistry", fee: "₹450.00", prep: "10-12 hour fasting required." },
                    { id: 3, name: "Lipid Panel & Cholesterol Breakdown", cat: "Cardiology", fee: "₹350.00", prep: "12 hour fasting required." },
                    { id: 4, name: "Resting 12-Lead Electrocardiogram (ECG)", cat: "Diagnostics", fee: "₹500.00", prep: "Avoid caffeine 4 hours prior." },
                  ].map((test) => (
                    <div key={test.id} style={{ padding: "18px 22px", border: "1px solid var(--color-border-card)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>{test.name}</h4>
                        <span style={{ fontSize: "0.85rem", color: "var(--color-sage)", fontWeight: 600 }}>{test.cat} • {test.prep}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <strong style={{ fontSize: "1.1rem", color: "var(--color-primary)" }}>{test.fee}</strong>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleBookLabTest(test.id)}>
                          Book Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Payments & Billing */}
            {(activeTab === "my-bills" || activeTab === "payment-history" || activeTab === "invoices" || activeTab === "receipts" || activeTab === "refund-status") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Billing &amp; Invoices</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  All platform charges, invoices, and payment receipts.
                </p>
                {invoices.length === 0 ? (
                  <p>No invoices on record.</p>
                ) : (
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td><code>{inv.invoice_number}</code></td>
                            <td>{inv.description}</td>
                            <td><strong>₹{inv.amount.toFixed(2)}</strong></td>
                            <td>
                              <span className={`status-badge-pill status-${inv.status?.toLowerCase()}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td>
                              {inv.status !== "PAID" ? (
                                <button className="btn btn-primary btn-sm" onClick={() => handlePayInvoice(inv.id)}>
                                  Pay Now
                                </button>
                              ) : (
                                <span style={{ fontSize: "0.85rem", color: "var(--color-sage)" }}>Receipt Available</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View: Family & Dependents */}
            {(activeTab === "family-members" || activeTab === "add-dependent" || activeTab === "family-appointments" || activeTab === "authorized-records") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Family &amp; Dependent Profiles</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Manage family members, schedule dependent consultations, and access authorized care proxies.
                </p>
                <div style={{ padding: "20px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>James Hayes (Child - 8 yrs)</h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>Pediatric Care Proxy Active • Blood Group: O+</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setActionMessage("Dependent registration request opened.")}>
                  + Add New Family Dependent
                </button>
              </div>
            )}

            {/* View: Follow-ups */}
            {(activeTab === "upcoming-followups" || activeTab === "followup-history" || activeTab === "medical-reminders") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Clinical Follow-up Reminders</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Automated schedules for routine checkups, chronic monitoring, and post-consultation reviews.
                </p>
                <div style={{ padding: "16px 20px", border: "1px solid var(--color-border-card)", borderRadius: "var(--radius-md)" }}>
                  <strong style={{ color: "var(--color-primary)" }}>Cardiovascular 6-Month Review</strong>
                  <p style={{ margin: "4px 0", color: "var(--color-text-body)", fontSize: "0.9rem" }}>
                    Recommended by Dr. Marcus Vance after lipid panel test completion.
                  </p>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-sage)" }}>Target Window: Next 30 Days</span>
                </div>
              </div>
            )}

            {/* View: Telemedicine */}
            {(activeTab === "online-consultations" || activeTab === "tele-history") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Virtual Telemedicine Suite</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  High-definition secure video consultations with end-to-end encrypted audio-video channels.
                </p>
                <div style={{ padding: "24px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <HospitalIcon size={40} />
                  <h4 style={{ margin: "12px 0 6px", color: "var(--color-primary)" }}>Telemedicine Room Ready</h4>
                  <p style={{ margin: "0 0 16px", color: "var(--color-text-body)", fontSize: "0.9rem" }}>
                    Your next virtual visit will automatically display a "Join Room" button 15 minutes before the slot.
                  </p>
                  <button className="btn btn-primary" onClick={() => setActionMessage("Virtual consultation room test initiated. Camera & microphone verified.")}>
                    Test Audio / Video Connection
                  </button>
                </div>
              </div>
            )}

            {/* View: Communication */}
            {(activeTab === "messages" || activeTab === "notifications" || activeTab === "contact-centre") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Communications &amp; Alerts</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Direct alerts regarding appointments, prescription updates, and clinic announcements.
                </p>
                <div style={{ display: "grid", gap: "10px" }}>
                  <div style={{ padding: "14px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                    <strong style={{ color: "var(--color-primary)" }}>Appointment Confirmed</strong>
                    <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                      Your appointment with Dr. Marcus Vance is confirmed. Reference: HC-DEMO-001.
                    </p>
                  </div>
                  <div style={{ padding: "14px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                    <strong style={{ color: "var(--color-primary)" }}>Clinic Safety Protocol Update</strong>
                    <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                      Health &amp; Cure facilities are open Mon-Fri 08:00 - 18:00. Fast-track check-in active.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* View: Feedback & Support */}
            {(activeTab === "doctor-reviews" || activeTab === "submit-feedback" || activeTab === "complaints" || activeTab === "help-support") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Submit Doctor / Clinic Feedback</h3>
                <form onSubmit={handleSubmitFeedback} style={{ display: "grid", gap: "14px" }}>
                  <label>
                    Rating (1 to 5 Stars)
                    <select
                      value={newFeedback.rating}
                      onChange={(e) => setNewFeedback({ ...newFeedback, rating: Number(e.target.value) })}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 - Exceptional Care</option>
                      <option value={4}>⭐⭐⭐⭐ 4 - Good Experience</option>
                      <option value={3}>⭐⭐⭐ 3 - Satisfactory</option>
                      <option value={2}>⭐⭐ 2 - Needs Improvement</option>
                      <option value={1}>⭐ 1 - Unsatisfactory</option>
                    </select>
                  </label>
                  <label>
                    Your Comments &amp; Review
                    <textarea
                      rows={3}
                      required
                      placeholder="Share your consultation or facility experience..."
                      value={newFeedback.comment}
                      onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                    />
                  </label>
                  <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            {/* View: My Account & Consent Control */}
            {(activeTab === "my-profile" || activeTab === "personal-info" || activeTab === "privacy-consent" || activeTab === "security-settings") && (
              <div style={{ display: "grid", gap: "24px" }}>
                {/* Consent Control Module */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header">
                    <div>
                      <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Doctor Access Consent Governance</h3>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                        Physicians must request access before viewing your medical history. You have full revocation power.
                      </p>
                    </div>
                  </div>

                  {accessRequests.length === 0 ? (
                    <p style={{ color: "var(--color-text-body)" }}>No pending or active access requests from physicians.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "14px" }}>
                      {accessRequests.map((req) => (
                        <div key={req.id} style={{ padding: "18px 22px", border: "1px solid var(--color-border-card)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                              <strong style={{ color: "var(--color-primary)" }}>Doctor #{req.doctorId}</strong>
                              <span className={`status-badge-pill status-${req.status?.toLowerCase()}`}>
                                {req.status}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                              Reason: {req.reason}
                            </p>
                          </div>
                          <div>
                            {req.status === "PENDING" && (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleConsent(req.id, true)}>
                                  <CheckIcon size={14} /> Approve Access
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => handleConsent(req.id, false)}>
                                  <CloseIcon size={14} /> Reject
                                </button>
                              </div>
                            )}
                            {req.status === "APPROVED" && (
                              <button className="btn btn-secondary btn-sm" onClick={() => handleConsent(req.id, false)}>
                                Revoke Access Now
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Profile Edit Form */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Personal Information</h3>
                  <form onSubmit={handleSaveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label>
                      Gender
                      <input
                        type="text"
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        placeholder="e.g. Female / Male"
                      />
                    </label>
                    <label>
                      Blood Group
                      <input
                        type="text"
                        value={profileForm.bloodGroup}
                        onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                        placeholder="e.g. O+, A+, B-"
                      />
                    </label>
                    <label style={{ gridColumn: "1 / -1" }}>
                      Residential Address
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="Street address, City, Postal Code"
                      />
                    </label>
                    <label style={{ gridColumn: "1 / -1" }}>
                      Emergency Contact Phone
                      <input
                        type="text"
                        value={profileForm.emergencyContact}
                        onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                        placeholder="+91 9051579029"
                      />
                    </label>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <button type="submit" className="btn btn-primary">
                        Update Profile Information
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            </main>
          </div>
        </div>
      </div>

      {/* Modal 1: View Doctor Diagnosis & Prescription */}
      {viewDiagnosisModalAppt && (
        <div
          className="portal-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "20px",
          }}
          onClick={() => setViewDiagnosisModalAppt(null)}
        >
          <div
            className="portal-modal-box"
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--color-border-subtle)", background: "#ECFDF5" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#065F46", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Verified Clinical Record
                </span>
                <h3 style={{ margin: "2px 0 0", color: "#064E3B", fontSize: "1.3rem" }}>
                  Official Doctor Diagnosis &amp; Prescription
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewDiagnosisModalAppt(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#065F46", padding: "4px" }}
              >
                <CloseIcon size={22} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Doctor & Date Header Card */}
              <div style={{ background: "var(--color-bg-tint)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--color-border-card)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Attending Physician</span>
                  <strong style={{ fontSize: "1.05rem", color: "var(--color-primary)" }}>{viewDiagnosisModalAppt.preferredDoctor || "Dr. Rajesh Sharma"}</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-body)", display: "block" }}>{viewDiagnosisModalAppt.specialty}</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Published / Verified On</span>
                  <strong>{viewDiagnosisModalAppt.diagnosisPublishedAt ? new Date(viewDiagnosisModalAppt.diagnosisPublishedAt).toLocaleDateString() : "Active Record"}</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", display: "block" }}>Ref: <code>{viewDiagnosisModalAppt.referenceCode}</code></span>
                </div>
              </div>

              {/* Diagnosis Assessment */}
              <div style={{ background: "#FFFFFF", border: "1.5px solid #10B981", borderRadius: "12px", padding: "18px 20px" }}>
                <span style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 700, textTransform: "uppercase" }}>Primary Diagnosis / Assessment</span>
                <h4 style={{ margin: "4px 0 0", color: "var(--color-primary)", fontSize: "1.15rem" }}>
                  {viewDiagnosisModalAppt.diagnosisTitle}
                </h4>
              </div>

              {/* Clinical Notes */}
              {viewDiagnosisModalAppt.clinicalNotes && (
                <div>
                  <h5 style={{ margin: "0 0 6px", color: "var(--color-primary)", fontSize: "0.92rem" }}>
                    Physician Examination Notes &amp; Observations
                  </h5>
                  <div style={{ background: "#F9FAFB", border: "1px solid var(--color-border-subtle)", padding: "14px 18px", borderRadius: "10px", fontSize: "0.92rem", color: "var(--color-text-body)", lineHeight: 1.6 }}>
                    {viewDiagnosisModalAppt.clinicalNotes}
                  </div>
                </div>
              )}

              {/* Prescribed Medications */}
              {viewDiagnosisModalAppt.prescriptions && (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #34D399", borderRadius: "12px", padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "#065F46", fontWeight: 700 }}>
                      💊 Prescribed Medications &amp; Dosage Instructions (Rx)
                    </span>
                    <span className="status-badge-pill status-confirmed" style={{ fontSize: "0.75rem" }}>Active Prescription</span>
                  </div>
                  <div style={{ whiteSpace: "pre-line", fontSize: "0.95rem", color: "#064E3B", lineHeight: 1.6, fontWeight: 500 }}>
                    {viewDiagnosisModalAppt.prescriptions}
                  </div>
                </div>
              )}

              {/* Follow-up Notes */}
              {viewDiagnosisModalAppt.followUpNotes && (
                <div>
                  <h5 style={{ margin: "0 0 6px", color: "var(--color-primary)", fontSize: "0.92rem" }}>
                    Follow-Up Instructions &amp; Lifestyle Advice
                  </h5>
                  <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", padding: "14px 18px", borderRadius: "10px", fontSize: "0.9rem", color: "#92400E", lineHeight: 1.5 }}>
                    {viewDiagnosisModalAppt.followUpNotes}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "6px", paddingTop: "14px", borderTop: "1px solid var(--color-border-subtle)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewDiagnosisModalAppt(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    handleDownloadPrescription({
                      id: viewDiagnosisModalAppt.id,
                      medicineName: viewDiagnosisModalAppt.diagnosisTitle,
                      doctorName: viewDiagnosisModalAppt.preferredDoctor || "Attending Physician",
                      specialty: viewDiagnosisModalAppt.specialty,
                      dosage: viewDiagnosisModalAppt.prescriptions || "Standard Course",
                      frequency: "As specified in consultation notes",
                      duration: "Per medical advice",
                      notes: viewDiagnosisModalAppt.followUpNotes || viewDiagnosisModalAppt.clinicalNotes,
                    });
                  }}
                >
                  📥 Download Digital Rx
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: View Appointment Booking Details */}
      {selectedApptModal && (
        <div
          className="portal-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={() => setSelectedApptModal(null)}
        >
          <div
            className="portal-modal-box"
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              maxWidth: "640px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--color-border-subtle)", background: "#F8FAF9" }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--color-primary)", fontSize: "1.3rem" }}>
                  Appointment Details
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Reference: <code>{selectedApptModal.referenceCode}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApptModal(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}
              >
                <CloseIcon size={22} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ background: "var(--color-bg-tint)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--color-border-card)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Department / Specialty</span>
                  <strong style={{ fontSize: "1.05rem", color: "var(--color-primary)" }}>{selectedApptModal.specialty}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Attendance / Status</span>
                  <span
                    className="status-badge-pill"
                    style={{
                      background: selectedApptModal.status === "ATTENDED" ? "#ECFDF5" : selectedApptModal.status === "NOT_ATTENDED" ? "#FEF2F2" : "#EFF6FF",
                      color: selectedApptModal.status === "ATTENDED" ? "#065F46" : selectedApptModal.status === "NOT_ATTENDED" ? "#991B1B" : "#1E40AF",
                      border: `1px solid ${selectedApptModal.status === "ATTENDED" ? "#10B981" : selectedApptModal.status === "NOT_ATTENDED" ? "#EF4444" : "#3B82F6"}`,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      display: "inline-block",
                    }}
                  >
                    {selectedApptModal.status === "ATTENDED" ? "✓ Attended & Completed" : selectedApptModal.status === "NOT_ATTENDED" ? "✗ Missed / Not Attended" : selectedApptModal.status}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Attending Physician</span>
                  <strong>{selectedApptModal.preferredDoctor || "Assigned Physician"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Consultation Mode</span>
                  <strong>{selectedApptModal.consultationType}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Scheduled Slot</span>
                  <strong>{selectedApptModal.timeSlot}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Patient Contact</span>
                  <strong>{selectedApptModal.patientPhone || user?.phone || "+91 9051579029"}</strong>
                </div>
              </div>

              {selectedApptModal.notes && (
                <div>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", display: "block", marginBottom: "4px" }}>
                    Reason for Scheduling / Reported Symptoms:
                  </span>
                  <div style={{ background: "#F9FAFB", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", fontSize: "0.9rem" }}>
                    {selectedApptModal.notes}
                  </div>
                </div>
              )}

              {selectedApptModal.diagnosisTitle && (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #34D399", padding: "16px 20px", borderRadius: "12px" }}>
                  <span style={{ fontSize: "0.82rem", color: "#065F46", fontWeight: 700 }}>Published Diagnosis:</span>
                  <p style={{ margin: "4px 0 10px", fontWeight: 700, color: "var(--color-primary)" }}>
                    {selectedApptModal.diagnosisTitle}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ background: "#059669", borderColor: "#059669" }}
                    onClick={() => {
                      setViewDiagnosisModalAppt(selectedApptModal);
                      setSelectedApptModal(null);
                    }}
                  >
                    📋 Open Full Diagnosis &amp; Prescriptions →
                  </button>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "12px", borderTop: "1px solid var(--color-border-subtle)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedApptModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
