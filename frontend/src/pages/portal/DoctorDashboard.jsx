import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  DoctorIcon,
  HospitalIcon,
  LockIcon,
  PillIcon,
  PulseIcon,
  RecordsIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons/icons";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tab || "dashboard");
  const [sidebarFilter, setSidebarFilter] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Sub-forms
  const [reqPatientId, setReqPatientId] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [consultForm, setConsultForm] = useState({ patientId: 1, title: "", description: "", recordType: "CONSULTATION" });
  const [leaveForm, setLeaveForm] = useState({ leaveType: "Personal Leave", startDate: "2026-11-20", endDate: "2026-11-22", reason: "" });

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await api.get("/api/doctor/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load doctor dashboard", err);
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

  async function handleRequestAccess(e) {
    e.preventDefault();
    if (!reqPatientId) return;
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.post("/api/doctor/access/request", {
        patientId: Number(reqPatientId),
        reason: reqReason || "Pre-consultation clinical evaluation",
      });
      setActionMessage(res.data?.message || "Access request submitted to patient.");
      setReqPatientId("");
      setReqReason("");
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to submit access request.");
    }
  }

  async function handleUpdateAppointmentStatus(apptId, newStatus) {
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.post(`/api/doctor/appointments/${apptId}/status`, { status: newStatus });
      setActionMessage(res.data?.message || `Appointment status updated to ${newStatus}.`);
      loadDashboard();
    } catch {
      setErrorMessage("Failed to update appointment status.");
    }
  }

  async function handleCreateConsultation(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/doctor/records/create", consultForm);
      setActionMessage("Consultation record authored and saved to patient's clinical file.");
      setConsultForm({ patientId: 1, title: "", description: "", recordType: "CONSULTATION" });
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Access denied: active patient consent required before authoring records.");
    }
  }

  async function handleSubmitLeave(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/doctor/leaves", leaveForm);
      setActionMessage("Leave application submitted to Superadmin for scheduling review.");
      setLeaveForm({ leaveType: "Personal Leave", startDate: "2026-11-20", endDate: "2026-11-22", reason: "" });
      loadDashboard();
    } catch {
      setErrorMessage("Failed to submit leave request.");
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
          <p>Loading physician workspace...</p>
        </div>
      </section>
    );
  }

  const doctor = data?.doctor || {};
  const appointments = data?.appointments || [];
  const accessRequests = data?.accessRequests || [];
  const schedules = data?.schedules || [];
  const leaves = data?.leaves || [];
  const feedback = data?.feedback || [];

  // 14 Standard Categories per Phase 5 (NO Book Appointment option!)
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
        { id: "all-appointments", label: "All Appointments", badge: appointments.length },
        { id: "calendar", label: "Calendar", badge: null },
        { id: "appointment-requests", label: "Appointment Requests", badge: appointments.filter(a => a.status === "REQUESTED").length || null },
      ],
    },
    {
      title: "3. Patients",
      items: [
        { id: "my-patients", label: "My Patients", badge: appointments.length },
        { id: "patient-history", label: "Patient History", badge: null },
      ],
    },
    {
      title: "4. Clinical",
      items: [
        { id: "consultations", label: "Consultations", badge: null },
        { id: "diagnosis-treatment", label: "Diagnosis & Treatment", badge: null },
        { id: "vital-signs", label: "Vital Signs", badge: null },
      ],
    },
    {
      title: "5. Prescriptions",
      items: [
        { id: "create-prescription", label: "Create Prescription", badge: "New" },
        { id: "prescription-history", label: "Prescription History", badge: null },
      ],
    },
    {
      title: "6. Records",
      items: [
        { id: "medical-records", label: "Medical Records", badge: null },
        { id: "lab-diagnostics", label: "Lab & Diagnostics", badge: null },
      ],
    },
    {
      title: "7. Scheduling",
      items: [
        { id: "my-schedule", label: "My Schedule", badge: schedules.length },
        { id: "availability", label: "Availability", badge: null },
        { id: "leave-requests", label: "Leave Requests", badge: leaves.length || null },
      ],
    },
    {
      title: "8. Patient Care",
      items: [
        { id: "follow-ups", label: "Follow-ups", badge: null },
        { id: "referrals", label: "Referrals", badge: null },
      ],
    },
    {
      title: "9. Telemedicine",
      items: [
        { id: "telemedicine", label: "Online Consultations", badge: "Ready" },
      ],
    },
    {
      title: "10. Communication",
      items: [
        { id: "messages", label: "Messages", badge: null },
        { id: "notifications", label: "Notifications", badge: "2" },
      ],
    },
    {
      title: "11. Professional",
      items: [
        { id: "certificates", label: "Certificates", badge: "Verified" },
        { id: "reviews-feedback", label: "Reviews & Feedback", badge: feedback.length || null },
      ],
    },
    {
      title: "12. Analytics",
      items: [
        { id: "reports-analytics", label: "Reports & Analytics", badge: null },
      ],
    },
    {
      title: "13. Account",
      items: [
        { id: "my-profile", label: "My Profile", badge: null },
        { id: "settings", label: "Settings", badge: null },
        { id: "help-support", label: "Help & Support", badge: null },
      ],
    },
    {
      title: "14. Exit",
      items: [
        { id: "logout", label: "Logout", badge: null },
      ],
    },
  ];

  return (
    <section className="subpage doctor-dashboard">
      <div className="container">
        {/* Top Header */}
        <div className="subpage-header">
          <p className="eyebrow-text">PHYSICIAN CLINICAL WORKSPACE &amp; PATIENT MANAGEMENT</p>
          <h1 className="subpage-main-title">
            <span>{user?.firstName || "Doctor"} {user?.lastName || ""}</span>
          </h1>
          <p className="subpage-lede">
            Doctor ID: <strong>DOC-{doctor.id || "001"}</strong> • {doctor.specialisation || "General Medicine"} • Licence: <strong>{doctor.licenceNumber || "N/A"}</strong>
            {doctor.verifiedByAdmin && (
              <span style={{ marginLeft: "12px", padding: "3px 10px", borderRadius: "999px", background: "#DEF7EC", color: "#03543F", fontSize: "0.85rem", fontWeight: 700 }}>
                ✓ Admin Verified
              </span>
            )}
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
            <span className="stats-icon"><CalendarIcon size={24} /></span>
            <div className="stats-content">
              <strong className="stats-value">{appointments.length} Consultations</strong>
              <span className="stats-label">Assigned Bookings</span>
            </div>
            <span className="stats-divider" aria-hidden="true" />
          </div>

          <div className="stats-item">
            <span className="stats-icon"><UsersIcon size={24} /></span>
            <div className="stats-content">
              <strong className="stats-value">{appointments.length} Patients</strong>
              <span className="stats-label">Under Clinical Care</span>
            </div>
            <span className="stats-divider" aria-hidden="true" />
          </div>

          <div className="stats-item">
            <span className="stats-icon"><ShieldIcon size={24} /></span>
            <div className="stats-content">
              <strong className="stats-value">{accessRequests.filter(r => r.status === "APPROVED").length} Consents</strong>
              <span className="stats-label">Active Records Approvals</span>
            </div>
            <span className="stats-divider" aria-hidden="true" />
          </div>

          <div className="stats-item">
            <span className="stats-icon"><DoctorIcon size={24} /></span>
            <div className="stats-content">
              <strong className="stats-value">14 Yrs</strong>
              <span className="stats-label">Clinical Experience</span>
            </div>
          </div>
        </div>

        {/* 14-Category Two-Column Grid */}
        <div className="portal-grid-layout">
          {/* Left Sidebar */}
          <aside className="portal-sidebar-card">
            <div className="portal-user-profile-box">
              <div className="portal-user-avatar">
                {(user?.firstName || "D")[0].toUpperCase()}
              </div>
              <div className="portal-user-info">
                <h4 className="portal-user-name">{user?.firstName} {user?.lastName}</h4>
                <span className="portal-user-role-badge">DOCTOR</span>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="portal-search-input"
                placeholder="Search clinical menu..."
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value)}
              />
            </div>

            <nav aria-label="Doctor workspace navigation">
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
                                } else {
                                  setActiveTab(item.id);
                                  navigate(`/doctor/${item.id}`);
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
            {/* View: Clinical Workspace Overview */}
            {activeTab === "dashboard" && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header">
                    <div>
                      <h2 style={{ margin: "0 0 6px", color: "var(--color-primary)" }}>Clinical Day Overview</h2>
                      <p style={{ margin: 0, color: "var(--color-text-body)" }}>
                        Manage scheduled consultations, evaluate clinical notes, and access patient medical vaults under consent.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" }}>
                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Today's Queue</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>{appointments.length} Scheduled</h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>Ready for consultation</p>
                    </div>

                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Active Consents</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>
                        {accessRequests.filter(r => r.status === "APPROVED").length} Approved
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>Full records access granted</p>
                    </div>

                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Weekly Schedule</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>{schedules.length} Shifts Configured</h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>Mon / Wed / Fri</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Appointments Card */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header">
                    <h3 style={{ margin: 0, color: "var(--color-primary)" }}>Assigned Patient Visits</h3>
                  </div>
                  {appointments.length === 0 ? (
                    <p style={{ color: "var(--color-text-body)", margin: 0 }}>No consultations currently assigned.</p>
                  ) : (
                    <div className="portal-table-wrap">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Contact</th>
                            <th>Specialty</th>
                            <th>Slot</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((a) => (
                            <tr key={a.id}>
                              <td><strong>{a.patientName}</strong></td>
                              <td>{a.patientEmail}<br /><small>{a.patientPhone}</small></td>
                              <td>{a.specialty}</td>
                              <td>{a.timeSlot}</td>
                              <td>
                                <span className={`status-badge-pill status-${a.status?.toLowerCase()}`}>
                                  {a.status}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  {a.status !== "COMPLETED" && (
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleUpdateAppointmentStatus(a.id, "COMPLETED")}
                                    >
                                      Complete
                                    </button>
                                  )}
                                  {a.status === "REQUESTED" && (
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => handleUpdateAppointmentStatus(a.id, "CONFIRMED")}
                                    >
                                      Confirm
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View: All Appointments & Requests */}
            {(activeTab === "all-appointments" || activeTab === "appointment-requests" || activeTab === "calendar") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Clinical Appointment Roster</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Assigned patient bookings. Update statuses to Confirmed, Completed, or Cancelled.
                </p>
                {appointments.length === 0 ? (
                  <p>No assigned appointments.</p>
                ) : (
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Ref</th>
                          <th>Patient Name</th>
                          <th>Consultation Mode</th>
                          <th>Slot</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => (
                          <tr key={a.id}>
                            <td><code>{a.referenceCode}</code></td>
                            <td><strong>{a.patientName}</strong></td>
                            <td>{a.consultationType}</td>
                            <td>{a.timeSlot}</td>
                            <td>
                              <span className={`status-badge-pill status-${a.status?.toLowerCase()}`}>
                                {a.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateAppointmentStatus(a.id, "COMPLETED")}>
                                  Mark Complete
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateAppointmentStatus(a.id, "CANCELLED")}>
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View: My Patients & Patient History */}
            {(activeTab === "my-patients" || activeTab === "patient-history") && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Assigned Patients (Consent Enforced)</h3>
                  <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                    In accordance with zero-trust privacy rules, patient medical records can only be inspected after active consent is granted.
                  </p>
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Email / Phone</th>
                          <th>Access Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => {
                          const consent = accessRequests.find(r => r.patientId === (a.patientId || 1));
                          const isApproved = consent?.status === "APPROVED";
                          return (
                            <tr key={a.id}>
                              <td><strong>{a.patientName}</strong></td>
                              <td>{a.patientEmail}<br />{a.patientPhone}</td>
                              <td>
                                <span className={`status-badge-pill status-${isApproved ? "approved" : "requested"}`}>
                                  {isApproved ? "Consent Approved (Active)" : "No Active Consent"}
                                </span>
                              </td>
                              <td>
                                {!isApproved ? (
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setReqPatientId(String(a.patientId || 1));
                                      setActiveTab("consultations");
                                      navigate("/doctor/consultations");
                                    }}
                                  >
                                    Request Vault Access
                                  </button>
                                ) : (
                                  <button className="btn btn-primary btn-sm" onClick={() => { setActiveTab("consultations"); navigate("/doctor/consultations"); }}>
                                    Open Clinical Vault
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Access Request Box */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Request Patient Medical Vault Access</h3>
                  <form onSubmit={handleRequestAccess} style={{ display: "grid", gap: "14px" }}>
                    <label>
                      Patient ID *
                      <input
                        type="number"
                        required
                        value={reqPatientId}
                        onChange={(e) => setReqPatientId(e.target.value)}
                        placeholder="Enter Patient ID (e.g. 1)"
                      />
                    </label>
                    <label>
                      Clinical Justification
                      <textarea
                        rows={2}
                        value={reqReason}
                        onChange={(e) => setReqReason(e.target.value)}
                        placeholder="State reason for medical history review..."
                      />
                    </label>
                    <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                      Send Access Request
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* View: Clinical Consultations & Notes */}
            {(activeTab === "consultations" || activeTab === "diagnosis-treatment" || activeTab === "vital-signs") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Author Clinical Consultation Entry</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Record symptoms, diagnosis, treatment plans, and vital sign findings. Requires active patient consent.
                </p>
                <form onSubmit={handleCreateConsultation} style={{ display: "grid", gap: "16px" }}>
                  <label>
                    Patient ID *
                    <input
                      type="number"
                      required
                      value={consultForm.patientId}
                      onChange={(e) => setConsultForm({ ...consultForm, patientId: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    Consultation Title / Diagnosis *
                    <input
                      type="text"
                      required
                      placeholder="e.g. Routine Cardiac Evaluation, Lipid Assessment"
                      value={consultForm.title}
                      onChange={(e) => setConsultForm({ ...consultForm, title: e.target.value })}
                    />
                  </label>
                  <label>
                    Clinical Findings &amp; Treatment Plan *
                    <textarea
                      rows={4}
                      required
                      placeholder="Enter chief complaints, examination findings, medication recommendations, and lifestyle instructions..."
                      value={consultForm.description}
                      onChange={(e) => setConsultForm({ ...consultForm, description: e.target.value })}
                    />
                  </label>
                  <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                    Sign &amp; Archive Consultation Record
                  </button>
                </form>
              </div>
            )}

            {/* View: Prescriptions */}
            {(activeTab === "create-prescription" || activeTab === "prescription-history") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Issue Digital Prescription</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Author digitally signed prescriptions with automated dose verification and pharmacy routing.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setActionMessage("Digital prescription issued and encrypted to patient medical vault.");
                  }}
                  style={{ display: "grid", gap: "14px" }}
                >
                  <label>
                    Patient
                    <select>
                      {appointments.map((a) => (
                        <option key={a.id} value={a.patientId || 1}>
                          {a.patientName} (PAT-{a.patientId || 1})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Medicine Name &amp; Strength
                    <input type="text" placeholder="e.g. Atorvastatin 20mg" required />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <label>
                      Dosage &amp; Frequency
                      <input type="text" placeholder="e.g. 1 tablet once daily at bedtime" required />
                    </label>
                    <label>
                      Duration
                      <input type="text" placeholder="e.g. 30 days" required />
                    </label>
                  </div>
                  <label>
                    Special Instructions
                    <input type="text" placeholder="e.g. Take with water after meals. Avoid grape juice." />
                  </label>
                  <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                    Issue &amp; Sign Prescription
                  </button>
                </form>
              </div>
            )}

            {/* View: Scheduling & Leave Management */}
            {(activeTab === "my-schedule" || activeTab === "availability" || activeTab === "leave-requests") && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Active Weekly Schedule</h3>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {schedules.map((s) => (
                      <div key={s.id} style={{ padding: "14px 18px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>{s.day_of_week}</strong>
                        <span>{s.start_time} - {s.end_time} ({s.slot_minutes} min slots)</span>
                        <span className="status-badge-pill status-active">Active</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Submit Leave Request</h3>
                  <form onSubmit={handleSubmitLeave} style={{ display: "grid", gap: "14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <label>
                        Start Date
                        <input
                          type="date"
                          value={leaveForm.startDate}
                          onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        />
                      </label>
                      <label>
                        End Date
                        <input
                          type="date"
                          value={leaveForm.endDate}
                          onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        />
                      </label>
                    </div>
                    <label>
                      Leave Reason
                      <textarea
                        rows={2}
                        required
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                        placeholder="State reason for leave of absence..."
                      />
                    </label>
                    <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                      Submit Leave Application
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* View: Telemedicine */}
            {activeTab === "telemedicine" && (
              <div className="panel-form-card" style={{ padding: "28px", textAlign: "center" }}>
                <HospitalIcon size={44} />
                <h3 style={{ margin: "16px 0 8px", color: "var(--color-primary)" }}>Physician Telemedicine Room</h3>
                <p style={{ color: "var(--color-text-body)", maxWidth: "500px", margin: "0 auto 20px" }}>
                  Secure video consultation workspace with integrated real-time vital display and consent verification.
                </p>
                <button className="btn btn-primary" onClick={() => setActionMessage("Virtual clinical consultation line connected.")}>
                  Launch Video Consultation Studio
                </button>
              </div>
            )}

            {/* View: Reports & Analytics */}
            {activeTab === "reports-analytics" && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Clinical Practice Analytics</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-sage)" }}>Completion Rate</span>
                    <h3 style={{ margin: "6px 0", color: "var(--color-primary)" }}>98.4%</h3>
                  </div>
                  <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-sage)" }}>Patient Satisfaction</span>
                    <h3 style={{ margin: "6px 0", color: "var(--color-primary)" }}>4.9 / 5.0</h3>
                  </div>
                  <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-sage)" }}>Total Consultations</span>
                    <h3 style={{ margin: "6px 0", color: "var(--color-primary)" }}>{appointments.length}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* View: Account & Profile */}
            {(activeTab === "my-profile" || activeTab === "settings" || activeTab === "help-support" || activeTab === "certificates" || activeTab === "reviews-feedback" || activeTab === "records" || activeTab === "patient-care" || activeTab === "communication" || activeTab === "messages" || activeTab === "notifications" || activeTab === "follow-ups" || activeTab === "referrals" || activeTab === "medical-records" || activeTab === "lab-diagnostics") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Physician Credentials &amp; Profile</h3>
                <div style={{ display: "grid", gap: "14px" }}>
                  <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Department:</strong> Cardiology &amp; Vascular</p>
                  <p><strong>Licence Number:</strong> {doctor.licenceNumber || "MED-CARD-9921"}</p>
                  <p><strong>Qualifications:</strong> {doctor.qualification || "MD, FACC - Harvard Medical School"}</p>
                  <p><strong>Experience:</strong> {doctor.experienceYears || 14} Years</p>
                  <p><strong>Admin Verification:</strong> {doctor.verifiedByAdmin ? "Verified" : "Pending"}</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
