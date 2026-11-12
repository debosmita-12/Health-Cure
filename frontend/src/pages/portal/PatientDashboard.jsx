import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
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

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await api.get("/api/patient/dashboard");
      setData(res.data);
      if (res.data?.patient) {
        setProfileForm({
          gender: res.data.patient.gender || "",
          bloodGroup: res.data.patient.bloodGroup || "",
          address: res.data.patient.address || "",
          emergencyContact: res.data.patient.emergencyContact || "",
        });
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
      setActiveTab(tab);
    } else {
      setActiveTab("dashboard");
    }
  }, [tab]);

  async function handleConsent(requestId, approve) {
    setActionMessage("");
    setErrorMessage("");
    try {
      const endpoint = approve ? "/api/patient/consent/approve" : "/api/patient/consent/revoke";
      const res = await api.post(endpoint, { requestId });
      setActionMessage(res.data?.message || (approve ? "Access approved." : "Access revoked."));
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
      await api.post("/api/patient/records/upload", uploadDoc);
      setActionMessage("Medical document securely encrypted and uploaded to your vault.");
      setUploadDoc({ title: "", description: "", recordType: "LAB_REPORT" });
      loadDashboard();
    } catch {
      setErrorMessage("Failed to upload document.");
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setActionMessage("");
    try {
      await api.put("/api/patient/profile", profileForm);
      setActionMessage("Profile details updated successfully.");
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

  function handleLogout() {
    logout();
    navigate("/");
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
    <section className="subpage patient-dashboard">
      <div className="container">
        {/* Top Header */}
        <div className="subpage-header">
          <p className="eyebrow-text">CENTRALIZED PATIENT VAULT &amp; HEALTHCARE PORTAL</p>
          <h1 className="subpage-main-title">
            Welcome, <span>{user?.firstName || "Patient"} {user?.lastName || ""}</span>
          </h1>
          <p className="subpage-lede">
            Patient ID: <strong>PAT-{patient.id || "001"}</strong> • Lifetime health records, diagnostic tests, consultations, and doctor consent governance.
          </p>
        </div>

        {/* Global Notifications */}
        {actionMessage && (
          <div className="form-success-card" style={{ marginBottom: "20px", padding: "14px 20px" }}>
            <p><strong>Success:</strong> {actionMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="form-error-alert" style={{ marginBottom: "20px" }}>
            <p><strong>Notice:</strong> {errorMessage}</p>
          </div>
        )}

        {/* Quick Stats Bar */}
        <div className="stats-bar-card" style={{ marginBottom: "28px", padding: "18px 24px" }}>
          <div className="stats-item">
            <span className="stats-icon"><UsersIcon size={24} /></span>
            <div className="stats-content">
              <strong className="stats-value">{patient.gender || "Patient"} ({patient.bloodGroup || "O+"})</strong>
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

        {/* 15-Category Two-Column Grid */}
        <div className="portal-grid-layout">
          {/* Left Sidebar */}
          <aside className="portal-sidebar-card">
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
                                  navigate("/book-appointment");
                                } else {
                                  setActiveTab(item.id);
                                  navigate(`/patient/${item.id}`);
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
                    <Link to="/book-appointment" className="btn btn-primary">
                      Book Appointment <ArrowRightIcon size={14} />
                    </Link>
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
                    <h3 style={{ margin: 0, color: "var(--color-primary)" }}>Scheduled Appointments</h3>
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
                            <th>Status</th>
                            <th>Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.slice(0, 3).map((a) => (
                            <tr key={a.id}>
                              <td><strong>{a.specialty}</strong></td>
                              <td>{a.preferredDoctor || "Assigned Physician"}</td>
                              <td>{a.timeSlot}</td>
                              <td>
                                <span className={`status-badge-pill status-${a.status?.toLowerCase()}`}>
                                  {a.status}
                                </span>
                              </td>
                              <td><code>{a.referenceCode}</code></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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
                      Track status, timing, consultation modes, and reference numbers.
                    </p>
                  </div>
                  <Link to="/book-appointment" className="btn btn-primary">
                    Book New Appointment
                  </Link>
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
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => (
                          <tr key={a.id}>
                            <td><code>{a.referenceCode}</code></td>
                            <td><strong>{a.specialty}</strong></td>
                            <td>{a.preferredDoctor || "Assigned"}</td>
                            <td>{a.consultationType}</td>
                            <td>{a.timeSlot}</td>
                            <td>
                              <span className={`status-badge-pill status-${a.status?.toLowerCase()}`}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View: Calendar */}
            {activeTab === "calendar" && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Appointment Calendar</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", marginBottom: "16px" }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} style={{ fontWeight: 700, padding: "8px", background: "var(--color-bg-tint)", borderRadius: "6px" }}>
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} style={{ border: "1px solid var(--color-border-subtle)", padding: "16px 8px", borderRadius: "6px", minHeight: "60px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-sage)" }}>{i + 1}</span>
                      {i === 14 && appointments.length > 0 && (
                        <div style={{ fontSize: "0.7rem", background: "#DEF7EC", color: "#03543F", padding: "2px 4px", borderRadius: "4px", marginTop: "4px" }}>
                          {appointments[0].specialty.split(" ")[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Doctors / Discovery */}
            {(activeTab === "find-doctor" || activeTab === "specializations" || activeTab === "doctor-profiles" || activeTab === "preferred-doctors") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Our Registered Physicians</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Browse accredited healthcare specialists available for in-clinic visits and telemedicine consultations.
                </p>
                <div style={{ display: "grid", gap: "16px" }}>
                  <div className="service-card-item" style={{ padding: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
                    <div className="service-card-icon-wrap"><DoctorIcon size={28} /></div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Dr. Marcus Vance</h4>
                      <p style={{ margin: "0 0 6px", fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                        Cardiology &amp; Preventive Care • MD, FACC - Harvard Medical School (14 years exp)
                      </p>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-sage)", fontWeight: 700 }}>
                        Fee: $75.00 • In-Clinic &amp; Telemedicine
                      </span>
                    </div>
                    <Link to="/book-appointment" className="btn btn-secondary btn-sm">
                      Book Visit
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* View: Medical Records */}
            {(activeTab === "medical-history" || activeTab === "consultation-history" || activeTab === "medical-documents" || activeTab === "lab-reports" || activeTab === "diagnostic-reports") && (
              <div style={{ display: "grid", gap: "24px" }}>
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
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Digital Prescriptions</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Prescriptions issued by verified physicians with dosage, refill instructions, and PDF download links.
                </p>
                <div style={{ padding: "20px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-card)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px", color: "var(--color-primary)" }}>Cardiovascular Support Regimen</h4>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-sage)" }}>Prescribed by Dr. Marcus Vance • Active</span>
                    </div>
                    <span className="status-badge-pill status-confirmed">Valid</span>
                  </div>
                  <ul style={{ margin: "10px 0 14px 20px", fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                    <li>Atorvastatin 20mg - 1 tablet daily at bedtime (30 days)</li>
                    <li>CoQ10 100mg - 1 capsule daily after breakfast (30 days)</li>
                  </ul>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActionMessage("Prescription PDF downloaded successfully.")}>
                    Download Prescription PDF
                  </button>
                </div>
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
                    { id: 1, name: "Complete Blood Count (CBC)", cat: "Hematology", fee: "$25.00", prep: "No fasting strictly required." },
                    { id: 2, name: "Comprehensive Metabolic Panel (CMP)", cat: "Biochemistry", fee: "$45.00", prep: "10-12 hour fasting required." },
                    { id: 3, name: "Lipid Panel & Cholesterol Breakdown", cat: "Cardiology", fee: "$35.00", prep: "12 hour fasting required." },
                    { id: 4, name: "Resting 12-Lead Electrocardiogram (ECG)", cat: "Diagnostics", fee: "$50.00", prep: "Avoid caffeine 4 hours prior." },
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
                            <td><strong>${inv.amount.toFixed(2)}</strong></td>
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
                        placeholder="+1 (555) 000-0000"
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
    </section>
  );
}
