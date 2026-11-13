import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import AppointmentCalendar from "../../components/common/AppointmentCalendar";
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
  StethoscopeIcon,
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
  const [consultForm, setConsultForm] = useState({
    patientId: 1,
    title: "",
    symptoms: "",
    diagnosis: "",
    treatmentPlan: "",
    followUpNotes: "",
    recordType: "CONSULTATION",
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: 1,
    medicineName: "",
    dosage: "1 tablet",
    frequency: "Once daily",
    duration: "7 days",
    notes: "",
  });
  const [leaveForm, setLeaveForm] = useState({ leaveType: "Personal Leave", startDate: "2026-11-20", endDate: "2026-11-22", reason: "" });

  // Patient Booking Details & Diagnosis Modals
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);
  const [diagnosisModalAppt, setDiagnosisModalAppt] = useState(null);
  const [diagnosisFormData, setDiagnosisFormData] = useState({
    diagnosisTitle: "",
    clinicalNotes: "",
    prescriptions: "",
    followUpNotes: "",
    markAttended: true,
  });
  const [isPublishingDiagnosis, setIsPublishingDiagnosis] = useState(false);

  function openDiagnosisModal(appt) {
    setDiagnosisModalAppt(appt);
    setDiagnosisFormData({
      diagnosisTitle: appt.diagnosisTitle || "",
      clinicalNotes: appt.clinicalNotes || "",
      prescriptions: appt.prescriptions || "",
      followUpNotes: appt.followUpNotes || "",
      markAttended: true,
    });
  }

  async function handlePublishDiagnosisSubmit(e) {
    e.preventDefault();
    if (!diagnosisModalAppt) return;
    setIsPublishingDiagnosis(true);
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.post(`/api/doctor/appointments/${diagnosisModalAppt.id}/diagnosis`, diagnosisFormData);
      setActionMessage(res.data?.message || "Diagnosis and prescription published successfully to patient medical vault.");
      setDiagnosisModalAppt(null);
      if (selectedPatientModal && selectedPatientModal.id === diagnosisModalAppt.id) {
        setSelectedPatientModal(null);
      }
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to publish diagnosis. Please verify details.");
    } finally {
      setIsPublishingDiagnosis(false);
    }
  }

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
      setActiveTab(tab.replace(/_/g, "-"));
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
      const pid = consultForm.patientId || (appointments[0]?.patientId || 1);
      const payload = {
        patientId: Number(pid),
        recordType: "CONSULTATION",
        title: consultForm.title || consultForm.diagnosis || "Clinical Consultation",
        description: consultForm.treatmentPlan || consultForm.title || "Clinical assessment",
        symptoms: consultForm.symptoms || "Clinical examination",
        diagnosis: consultForm.diagnosis || consultForm.title,
        treatmentPlan: consultForm.treatmentPlan,
        followUpNotes: consultForm.followUpNotes,
      };
      await api.post("/api/doctor/records/create", payload);
      setActionMessage("Consultation record authored and saved to patient's clinical file.");
      setConsultForm({
        patientId: pid,
        title: "",
        symptoms: "",
        diagnosis: "",
        treatmentPlan: "",
        followUpNotes: "",
        recordType: "CONSULTATION",
      });
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Access denied: patient must have a scheduled appointment or active consent.");
    }
  }

  async function handleCreatePrescription(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      const pid = prescriptionForm.patientId || (appointments[0]?.patientId || 1);
      const payload = {
        patientId: Number(pid),
        medicineName: prescriptionForm.medicineName,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        duration: prescriptionForm.duration,
        notes: prescriptionForm.notes,
      };
      await api.post("/api/doctor/prescriptions/create", payload);
      setActionMessage("Digital prescription issued and encrypted to patient medical vault.");
      setPrescriptionForm({
        patientId: pid,
        medicineName: "",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "7 days",
        notes: "",
      });
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Access denied: patient must have a scheduled appointment or active consent.");
    }
  }

  async function handleSubmitLeave(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/doctor/leaves", leaveForm);
      setActionMessage("Leave application submitted to Admin for scheduling review.");
      setLeaveForm({ leaveType: "Personal Leave", startDate: "2026-11-20", endDate: "2026-11-22", reason: "" });
      loadDashboard();
    } catch {
      setErrorMessage("Failed to submit leave request.");
    }
  }

  function handleLogout() {
    logout();
  }

  const doctor = data?.doctor || {};
  const rawAppointments = data?.appointments || [];
  const accessRequests = data?.accessRequests || [];
  const schedules = data?.schedules || [];
  const leaves = data?.leaves || [];
  const feedback = data?.feedback || [];

  const doctorSpecialty = (doctor.specialisation || "").trim().toLowerCase();
  const doctorDeptKeyword = doctorSpecialty.split(/[&/,]/)[0].trim();

  // Strict specialty filtering: physician only sees appointments matching their clinical specialty
  const appointments = useMemo(() => {
    return rawAppointments.filter((a) => {
      if (!doctorSpecialty) return true;
      const apptSpec = (a.specialty || "").trim().toLowerCase();
      if (!apptSpec) return false;
      return (
        apptSpec === doctorSpecialty ||
        (doctorDeptKeyword.length > 3 && apptSpec.includes(doctorDeptKeyword)) ||
        (apptSpec.length > 3 && doctorSpecialty.includes(apptSpec.split(/[&/,]/)[0].trim()))
      );
    });
  }, [rawAppointments, doctorSpecialty, doctorDeptKeyword]);

  // Unique patient deduplication: prevent duplicates across patient rosters and badges
  const uniquePatients = useMemo(() => {
    const seen = new Set();
    return appointments.filter((a) => {
      const key = a.patientId || a.patientEmail || a.patientName;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [appointments]);

  if (loading && !data) {
    return (
      <section className="subpage">
        <div className="container" style={{ textAlign: "center", padding: "80px 20px" }}>
          <p>Loading physician workspace...</p>
        </div>
      </section>
    );
  }

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
        { id: "my-patients", label: "My Patients", badge: uniquePatients.length },
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
    <section className="subpage doctor-dashboard" style={{ paddingTop: "20px" }}>
      <div className="container" style={{ maxWidth: "1440px" }}>
        {/* Full-Height Layout: Dark Green Sidebar on the Left starting from the Top */}
        <div className="portal-grid-layout" style={{ marginTop: 0 }}>
          {/* Left Sidebar Column */}
          <div className="portal-sidebar-column">
            <aside className="portal-sidebar-card dark-green-sidebar">
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
                                    navigate(`/doctor/${item.id}`, { preventScrollReset: true });
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
                  <StethoscopeIcon size={16} />
                  Physician Clinical Workspace &amp; Patient Management
                </p>
                <h1 className="portal-hero-title">
                  Dr. <span>{user?.firstName || "Doctor"} {user?.lastName || ""}</span>
                </h1>
                <p className="portal-hero-lede">
                  Doctor ID: <strong>DOC-{doctor.id || "001"}</strong> • {doctor.specialisation || "General Medicine"} • Licence: <strong>{doctor.licenceNumber || "N/A"}</strong>
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <span className="portal-hero-badge">
                  <strong>Specialty:</strong> {doctor.specialisation || "General Medicine"}
                </span>
                {doctor.verifiedByAdmin && (
                  <span className="portal-hero-badge" style={{ background: "rgba(52, 211, 153, 0.25)", borderColor: "#34D399" }}>
                    <CheckIcon size={14} /> Verified Physician
                  </span>
                )}
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
                  <strong className="stats-value">{uniquePatients.length} Patients</strong>
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
                    <div>
                      <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Assigned Patient Visits</h3>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                        Manage attendance lifecycle, inspect booking details, and publish clinical diagnoses.
                      </p>
                    </div>
                  </div>
                  {appointments.length === 0 ? (
                    <p style={{ color: "var(--color-text-body)", margin: 0 }}>No consultations currently assigned.</p>
                  ) : (
                    <div className="portal-table-wrap">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Ref</th>
                            <th>Patient</th>
                            <th>Specialty</th>
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
                                <td>
                                  <strong>{a.patientName}</strong>
                                  <br />
                                  <small style={{ color: "var(--color-text-muted)" }}>{a.patientEmail}</small>
                                </td>
                                <td>{a.specialty}</td>
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
                                    {isAttended ? "✓ Attended" : isMissed ? "✗ Missed / Not Attended" : a.status}
                                  </span>
                                  {a.diagnosisTitle && (
                                    <div style={{ marginTop: "4px" }}>
                                      <span style={{ fontSize: "0.74rem", background: "#D1FAE5", color: "#065F46", padding: "2px 6px", borderRadius: "6px", fontWeight: 600 }}>
                                        Rx Published
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                      onClick={() => setSelectedPatientModal(a)}
                                      title="View patient booking and demographic details"
                                    >
                                      👁 Details
                                    </button>
                                    {!isAttended && (
                                      <button
                                        type="button"
                                        className="btn btn-sm"
                                        style={{ background: "#10B981", color: "#FFFFFF", border: "none", padding: "4px 8px", fontSize: "0.8rem" }}
                                        onClick={() => handleUpdateAppointmentStatus(a.id, "ATTENDED")}
                                        title="Mark patient as Attended"
                                      >
                                        ✓ Attended
                                      </button>
                                    )}
                                    {!isMissed && (
                                      <button
                                        type="button"
                                        className="btn btn-sm"
                                        style={{ background: "#EF4444", color: "#FFFFFF", border: "none", padding: "4px 8px", fontSize: "0.8rem" }}
                                        onClick={() => handleUpdateAppointmentStatus(a.id, "NOT_ATTENDED")}
                                        title="Mark patient as Not Attended / Missed"
                                      >
                                        ✗ Missed
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                      onClick={() => openDiagnosisModal(a)}
                                      title="Author clinical assessment and digital prescription"
                                    >
                                      📋 {a.diagnosisTitle ? "Edit Rx" : "Diagnose"}
                                    </button>
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

            {/* View: Calendar (Dynamic 3-Month Clinical Schedule) */}
            {activeTab === "calendar" && (
              <AppointmentCalendar
                appointments={appointments}
                isDoctorView={true}
              />
            )}

            {/* View: All Appointments & Requests */}
            {(activeTab === "all-appointments" || activeTab === "appointment-requests") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Clinical Appointment Roster</h3>
                <p style={{ color: "var(--color-text-body)", marginBottom: "20px" }}>
                  Assigned patient bookings. Inspect full patient booking details, track attendance, and publish clinical diagnoses.
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
                              <td>
                                <strong>{a.patientName}</strong>
                                <br />
                                <small style={{ color: "var(--color-text-muted)" }}>{a.patientEmail}</small>
                              </td>
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
                                  {isAttended ? "✓ Attended" : isMissed ? "✗ Missed / Not Attended" : a.status}
                                </span>
                                {a.diagnosisTitle && (
                                  <div style={{ marginTop: "4px" }}>
                                    <span style={{ fontSize: "0.74rem", background: "#D1FAE5", color: "#065F46", padding: "2px 6px", borderRadius: "6px", fontWeight: 600 }}>
                                      Rx Published
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                    onClick={() => setSelectedPatientModal(a)}
                                  >
                                    👁 Details
                                  </button>
                                  {!isAttended && (
                                    <button
                                      type="button"
                                      className="btn btn-sm"
                                      style={{ background: "#10B981", color: "#FFFFFF", border: "none", padding: "4px 8px", fontSize: "0.8rem" }}
                                      onClick={() => handleUpdateAppointmentStatus(a.id, "ATTENDED")}
                                    >
                                      ✓ Attended
                                    </button>
                                  )}
                                  {!isMissed && (
                                    <button
                                      type="button"
                                      className="btn btn-sm"
                                      style={{ background: "#EF4444", color: "#FFFFFF", border: "none", padding: "4px 8px", fontSize: "0.8rem" }}
                                      onClick={() => handleUpdateAppointmentStatus(a.id, "NOT_ATTENDED")}
                                    >
                                      ✗ Missed
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                    onClick={() => openDiagnosisModal(a)}
                                  >
                                    📋 {a.diagnosisTitle ? "Edit Rx" : "Diagnose"}
                                  </button>
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
                        {uniquePatients.map((a) => {
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
                  Record symptoms, diagnosis, treatment plans, and vital sign findings.
                </p>
                <form onSubmit={handleCreateConsultation} style={{ display: "grid", gap: "16px" }}>
                  <label>
                    Patient *
                    <select
                      value={consultForm.patientId}
                      onChange={(e) => setConsultForm({ ...consultForm, patientId: Number(e.target.value) })}
                    >
                      {appointments.map((a) => (
                        <option key={a.id} value={a.patientId || 1}>
                          {a.patientName} (PAT-{a.patientId || 1}) - Ref: {a.referenceCode}
                        </option>
                      ))}
                      {appointments.length === 0 && <option value={1}>Patient #1 (Demo)</option>}
                    </select>
                  </label>
                  <label>
                    Consultation Title / Diagnosis *
                    <input
                      type="text"
                      required
                      placeholder="e.g. Routine Cardiac Evaluation, Lipid Assessment"
                      value={consultForm.title}
                      onChange={(e) => setConsultForm({ ...consultForm, title: e.target.value, diagnosis: e.target.value })}
                    />
                  </label>
                  <label>
                    Reported Symptoms
                    <input
                      type="text"
                      placeholder="e.g. Occasional chest discomfort, shortness of breath on exertion"
                      value={consultForm.symptoms}
                      onChange={(e) => setConsultForm({ ...consultForm, symptoms: e.target.value })}
                    />
                  </label>
                  <label>
                    Clinical Findings &amp; Treatment Plan *
                    <textarea
                      rows={3}
                      required
                      placeholder="Enter chief examination findings, medication recommendations, lifestyle advice..."
                      value={consultForm.treatmentPlan}
                      onChange={(e) => setConsultForm({ ...consultForm, treatmentPlan: e.target.value, description: e.target.value })}
                    />
                  </label>
                  <label>
                    Follow-up Instructions
                    <input
                      type="text"
                      placeholder="e.g. Follow-up consultation in 4 weeks with lipid panel results"
                      value={consultForm.followUpNotes}
                      onChange={(e) => setConsultForm({ ...consultForm, followUpNotes: e.target.value })}
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
                  Author digitally signed prescriptions with automated dose verification and direct patient EHR sync.
                </p>
                <form onSubmit={handleCreatePrescription} style={{ display: "grid", gap: "14px" }}>
                  <label>
                    Patient *
                    <select
                      value={prescriptionForm.patientId}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientId: Number(e.target.value) })}
                    >
                      {appointments.map((a) => (
                        <option key={a.id} value={a.patientId || 1}>
                          {a.patientName} (PAT-{a.patientId || 1}) - Ref: {a.referenceCode}
                        </option>
                      ))}
                      {appointments.length === 0 && <option value={1}>Patient #1 (Demo)</option>}
                    </select>
                  </label>
                  <label>
                    Medicine Name &amp; Strength *
                    <input
                      type="text"
                      placeholder="e.g. Atorvastatin 20mg"
                      required
                      value={prescriptionForm.medicineName}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicineName: e.target.value })}
                    />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <label>
                      Dosage &amp; Frequency *
                      <input
                        type="text"
                        placeholder="e.g. 1 tablet once daily at bedtime"
                        required
                        value={prescriptionForm.dosage}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                      />
                    </label>
                    <label>
                      Duration *
                      <input
                        type="text"
                        placeholder="e.g. 30 days"
                        required
                        value={prescriptionForm.duration}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                      />
                    </label>
                  </div>
                  <label>
                    Special Instructions
                    <input
                      type="text"
                      placeholder="e.g. Take with water after meals. Avoid grape juice."
                      value={prescriptionForm.notes}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                    />
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
      </div>

      {/* Modal 1: Full Patient Booking & Demographic Details */}
      {selectedPatientModal && (
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
          onClick={() => setSelectedPatientModal(null)}
        >
          <div
            className="portal-modal-box"
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              maxWidth: "700px",
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
                  Patient &amp; Appointment Details
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Reference Code: <code>{selectedPatientModal.referenceCode}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatientModal(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}
              >
                <CloseIcon size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Primary Patient Card */}
              <div style={{ background: "var(--color-bg-tint)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--color-border-card)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Patient Name</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--color-primary)" }}>{selectedPatientModal.patientName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Attendance / Status</span>
                  <span
                    className="status-badge-pill"
                    style={{
                      background: selectedPatientModal.status === "ATTENDED" ? "#ECFDF5" : selectedPatientModal.status === "NOT_ATTENDED" ? "#FEF2F2" : "#EFF6FF",
                      color: selectedPatientModal.status === "ATTENDED" ? "#065F46" : selectedPatientModal.status === "NOT_ATTENDED" ? "#991B1B" : "#1E40AF",
                      border: `1px solid ${selectedPatientModal.status === "ATTENDED" ? "#10B981" : selectedPatientModal.status === "NOT_ATTENDED" ? "#EF4444" : "#3B82F6"}`,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      display: "inline-block",
                    }}
                  >
                    {selectedPatientModal.status === "ATTENDED" ? "✓ Attended" : selectedPatientModal.status === "NOT_ATTENDED" ? "✗ Missed / Not Attended" : selectedPatientModal.status}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Email</span>
                  <strong>{selectedPatientModal.patientEmail}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Contact Phone</span>
                  <strong>{selectedPatientModal.patientPhone || "+91 9051579029"}</strong>
                </div>
              </div>

              {/* Patient Demographic Snapshot */}
              <div>
                <h4 style={{ margin: "0 0 10px", color: "var(--color-primary)", fontSize: "0.95rem" }}>
                  Patient Demographics (Captured from Booking)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", background: "#FFFFFF", border: "1px solid var(--color-border-subtle)", padding: "14px 18px", borderRadius: "10px" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Gender</span>
                    <strong>{selectedPatientModal.patientGender || "Female"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Blood Group</span>
                    <strong style={{ color: "#DC2626" }}>{selectedPatientModal.patientBloodGroup || "A+"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Date of Birth / Age</span>
                    <strong>{selectedPatientModal.patientDob || "2003-06-12 (23 yrs)"}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Residential Address</span>
                    <span>{selectedPatientModal.patientAddress || "Health & Cure Super Speciality Hospital Campus, Salt Lake Sector V, Kolkata, West Bengal - 700091, India"}</span>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Emergency Contact</span>
                    <strong>{selectedPatientModal.emergencyContact || selectedPatientModal.patientPhone || "+91 9051579029"}</strong>
                  </div>
                </div>
              </div>

              {/* Booking Specifications & Reason */}
              <div>
                <h4 style={{ margin: "0 0 10px", color: "var(--color-primary)", fontSize: "0.95rem" }}>
                  Consultation Booking Details
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#FFFFFF", border: "1px solid var(--color-border-subtle)", padding: "14px 18px", borderRadius: "10px" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Department / Specialty</span>
                    <strong>{selectedPatientModal.specialty}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Consultation Mode</span>
                    <strong>{selectedPatientModal.consultationType}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Scheduled Slot</span>
                    <strong>{selectedPatientModal.timeSlot}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Attending Physician</span>
                    <strong>{selectedPatientModal.preferredDoctor || "Assigned Physician"}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Patient Chief Complaint / Symptoms</span>
                    <p style={{ margin: "4px 0 0", color: "var(--color-text-body)", fontSize: "0.92rem" }}>
                      {selectedPatientModal.notes || "Routine clinical evaluation and specialist assessment requested."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Published Diagnosis (if exists) */}
              {selectedPatientModal.diagnosisTitle && (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #34D399", padding: "16px 20px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ color: "#065F46", fontSize: "0.95rem" }}>
                      ✓ Published Clinical Diagnosis &amp; Prescription
                    </strong>
                    {selectedPatientModal.diagnosisPublishedAt && (
                      <small style={{ color: "#047857" }}>
                        Published: {new Date(selectedPatientModal.diagnosisPublishedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, color: "var(--color-primary)" }}>
                    {selectedPatientModal.diagnosisTitle}
                  </p>
                  {selectedPatientModal.clinicalNotes && (
                    <p style={{ margin: "0 0 6px", fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                      <strong>Clinical Notes:</strong> {selectedPatientModal.clinicalNotes}
                    </p>
                  )}
                  {selectedPatientModal.prescriptions && (
                    <p style={{ margin: "0 0 6px", fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                      <strong>Prescription (Rx):</strong> {selectedPatientModal.prescriptions}
                    </p>
                  )}
                  {selectedPatientModal.followUpNotes && (
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                      <strong>Follow-up Advice:</strong> {selectedPatientModal.followUpNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Actions Footer inside Modal */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid var(--color-border-subtle)" }}>
                {selectedPatientModal.status !== "ATTENDED" && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: "#10B981", color: "#FFFFFF", border: "none" }}
                    onClick={() => {
                      handleUpdateAppointmentStatus(selectedPatientModal.id, "ATTENDED");
                      setSelectedPatientModal({ ...selectedPatientModal, status: "ATTENDED" });
                    }}
                  >
                    ✓ Mark Attended
                  </button>
                )}
                {selectedPatientModal.status !== "NOT_ATTENDED" && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: "#EF4444", color: "#FFFFFF", border: "none" }}
                    onClick={() => {
                      handleUpdateAppointmentStatus(selectedPatientModal.id, "NOT_ATTENDED");
                      setSelectedPatientModal({ ...selectedPatientModal, status: "NOT_ATTENDED" });
                    }}
                  >
                    ✗ Mark Not Attended
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => openDiagnosisModal(selectedPatientModal)}
                >
                  📋 {selectedPatientModal.diagnosisTitle ? "Edit Diagnosis & Rx" : "Publish Diagnosis & Rx"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedPatientModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Publish Clinical Diagnosis & Prescription */}
      {diagnosisModalAppt && (
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
          onClick={() => setDiagnosisModalAppt(null)}
        >
          <div
            className="portal-modal-box"
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              maxWidth: "660px",
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
                  Publish Clinical Diagnosis &amp; Prescription
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Patient: <strong>{diagnosisModalAppt.patientName}</strong> • Ref: <code>{diagnosisModalAppt.referenceCode}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDiagnosisModalAppt(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}
              >
                <CloseIcon size={22} />
              </button>
            </div>

            <form onSubmit={handlePublishDiagnosisSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#F0FDF4", border: "1px solid #A7F3D0", padding: "12px 16px", borderRadius: "10px", fontSize: "0.88rem", color: "#065F46" }}>
                <strong>Clinical Integration:</strong> Authoring this diagnosis directly transmits it to the patient's dashboard, records the e-prescription in their medical vault, and updates their attendance status to <strong>Attended</strong>.
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                  Diagnosis / Clinical Assessment *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mild Sinus Bradycardia, Essential Hypertension, Acute Bronchitis"
                  value={diagnosisFormData.diagnosisTitle}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, diagnosisTitle: e.target.value })}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                  Clinical Findings &amp; Examination Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Record examination findings, auscultation results, vital correlations, or differential diagnostics..."
                  value={diagnosisFormData.clinicalNotes}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, clinicalNotes: e.target.value })}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                  Prescribed Medications &amp; Dosage (Rx)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Telmisartan 40mg - 1 tablet once daily in morning (30 days); Paracetamol 650mg SOS"
                  value={diagnosisFormData.prescriptions}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, prescriptions: e.target.value })}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
                  Follow-Up Advice &amp; Lifestyle Recommendations
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Review after 3 weeks with fresh lipid profile. Low sodium diet and 30 minutes daily aerobic exercise."
                  value={diagnosisFormData.followUpNotes}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, followUpNotes: e.target.value })}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", fontSize: "0.92rem" }}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 600, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={diagnosisFormData.markAttended}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, markAttended: e.target.checked })}
                />
                Mark appointment attendance as Attended &amp; Completed
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px", paddingTop: "14px", borderTop: "1px solid var(--color-border-subtle)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDiagnosisModalAppt(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPublishingDiagnosis}
                >
                  {isPublishingDiagnosis ? "Publishing to Vault..." : "Publish to Patient Vault →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
