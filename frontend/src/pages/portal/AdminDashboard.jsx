import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  AuditIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  DatabaseIcon,
  DoctorIcon,
  HospitalIcon,
  LockIcon,
  PulseIcon,
  RecordsIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons/icons";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tab || "dashboard");
  const [sidebarFilter, setSidebarFilter] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedAdminAppt, setSelectedAdminAppt] = useState(null);

  // Sub-forms
  const [newDoctor, setNewDoctor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialisation: "General Medicine",
    licenceNumber: "",
    qualification: "",
    experienceYears: 5,
  });

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    headDoctorName: "",
  });

  const [newStaff, setNewStaff] = useState({
    employeeId: "EMP-200",
    name: "",
    email: "",
    roleGroup: "Nurse Coordinator",
    departmentId: 1,
    phone: "",
  });

  const [newLabTest, setNewLabTest] = useState({
    name: "",
    category: "Biochemistry",
    price: 30,
    description: "",
    preparationInstructions: "",
  });

  const [settingsForm, setSettingsForm] = useState({
    center_name: "Health & Cure Connected Care Centre",
    emergency_phone: "+91 9051579029",
    consultation_buffer_minutes: "15",
    record_retention_years: "7",
  });

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/dashboard");
      setData(res.data);
      if (res.data?.settings) {
        setSettingsForm((prev) => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error("Failed to load admin dashboard", err);
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

  async function handleVerifyDoctor(doctorId) {
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.post(`/api/admin/doctors/${doctorId}/verify`);
      setActionMessage(res.data?.message || "Doctor credentials verified.");
      loadDashboard();
    } catch {
      setErrorMessage("Failed to verify doctor credentials.");
    }
  }

  async function handleAddDoctor(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/admin/doctors", newDoctor);
      setActionMessage(`Doctor ${newDoctor.firstName} ${newDoctor.lastName} provisioned successfully.`);
      setNewDoctor({
        firstName: "",
        lastName: "",
        email: "",
        specialisation: "General Medicine",
        licenceNumber: "",
        qualification: "",
        experienceYears: 5,
      });
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to create doctor account.");
    }
  }

  async function handleAddDepartment(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/admin/departments", newDepartment);
      setActionMessage(`Department ${newDepartment.name} created.`);
      setNewDepartment({ name: "", description: "", headDoctorName: "" });
      loadDashboard();
    } catch {
      setErrorMessage("Failed to add department.");
    }
  }

  async function handleAddStaff(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/admin/staff", newStaff);
      setActionMessage(`Staff member ${newStaff.name} registered.`);
      setNewStaff({ employeeId: "EMP-20" + Math.floor(Math.random() * 90), name: "", email: "", roleGroup: "Nurse Coordinator", departmentId: 1, phone: "" });
      loadDashboard();
    } catch {
      setErrorMessage("Failed to add staff member.");
    }
  }

  async function handleAddLabTest(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/admin/lab-tests", newLabTest);
      setActionMessage(`Diagnostic test ${newLabTest.name} added to catalog.`);
      setNewLabTest({ name: "", category: "Biochemistry", price: 30, description: "", preparationInstructions: "" });
      loadDashboard();
    } catch {
      setErrorMessage("Failed to add diagnostic test.");
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post("/api/admin/settings", settingsForm);
      setActionMessage("Platform settings saved and propagated.");
      loadDashboard();
    } catch {
      setErrorMessage("Failed to save settings.");
    }
  }

  async function handleUpdateAppointmentStatus(apptId, newStatus) {
    setActionMessage("");
    setErrorMessage("");
    try {
      await api.post(`/api/admin/appointments/${apptId}/status`, { status: newStatus });
      setActionMessage(`Appointment status updated to ${newStatus}.`);
      loadDashboard();
    } catch {
      setErrorMessage("Failed to update appointment status.");
    }
  }

  function handleLogout() {
    logout();
  }

  if (loading && !data) {
    return (
      <section className="subpage">
        <div className="container" style={{ textAlign: "center", padding: "80px 20px" }}>
          <p>Loading Admin governance console...</p>
        </div>
      </section>
    );
  }

  const doctors = data?.doctors || [];
  const appointments = data?.appointments || [];
  const auditLogs = data?.auditLogs || [];
  const departments = data?.departments || [];
  const staff = data?.staff || [];
  const billing = data?.billing || [];
  const labTests = data?.labTests || [];
  const settings = data?.settings || {};

  // 21 Standard Categories per Phase 6
  const menuCategories = [
    {
      title: "1. Overview",
      items: [
        { id: "dashboard", label: "Dashboard", badge: null },
      ],
    },
    {
      title: "2. Doctor Management",
      items: [
        { id: "all-doctors", label: "All Doctors", badge: doctors.length },
        { id: "add-doctor", label: "Add Doctor", badge: "New" },
        { id: "doctor-verification", label: "Doctor Verification", badge: doctors.filter(d => !d.verifiedByAdmin).length || "All OK" },
        { id: "doctor-performance", label: "Doctor Performance", badge: null },
      ],
    },
    {
      title: "3. Patient Management",
      items: [
        { id: "all-patients", label: "All Patients", badge: null },
        { id: "register-patient", label: "Register Patient", badge: null },
        { id: "patient-history", label: "Patient History", badge: null },
        { id: "patient-requests", label: "Patient Requests", badge: null },
      ],
    },
    {
      title: "4. Appointments",
      items: [
        { id: "all-appointments", label: "All Appointments", badge: appointments.length },
        { id: "appointment-calendar", label: "Appointment Calendar", badge: null },
        { id: "pending-requests", label: "Pending Requests", badge: appointments.filter(a => a.status === "REQUESTED").length || null },
        { id: "appointment-history", label: "Appointment History", badge: null },
      ],
    },
    {
      title: "5. Departments",
      items: [
        { id: "all-departments", label: "All Departments", badge: departments.length },
        { id: "add-department", label: "Add Department", badge: null },
        { id: "specializations", label: "Specializations", badge: null },
        { id: "department-assignments", label: "Department Assignments", badge: null },
      ],
    },
    {
      title: "6. Staff Management",
      items: [
        { id: "all-staff", label: "All Staff", badge: staff.length },
        { id: "add-staff", label: "Add Staff", badge: null },
        { id: "roles-permissions", label: "Roles & Permissions", badge: null },
        { id: "attendance", label: "Attendance", badge: null },
        { id: "leave-management", label: "Leave Management", badge: null },
      ],
    },
    {
      title: "7. Schedule & Facilities",
      items: [
        { id: "doctor-schedules", label: "Doctor Schedules", badge: null },
        { id: "facility-availability", label: "Availability", badge: null },
        { id: "room-management", label: "Room Management", badge: null },
        { id: "holidays", label: "Holidays", badge: null },
        { id: "facility-management", label: "Facility Management", badge: null },
      ],
    },
    {
      title: "8. Medical Records",
      items: [
        { id: "all-medical-records", label: "All Medical Records", badge: "Zero-Trust" },
        { id: "document-management", label: "Document Management", badge: null },
        { id: "record-access-logs", label: "Record Access Logs", badge: null },
      ],
    },
    {
      title: "9. Prescriptions",
      items: [
        { id: "all-prescriptions", label: "All Prescriptions", badge: null },
        { id: "prescription-templates", label: "Prescription Templates", badge: null },
        { id: "prescription-history", label: "Prescription History", badge: null },
      ],
    },
    {
      title: "10. Laboratory & Diagnostics",
      items: [
        { id: "test-management", label: "Test Management", badge: labTests.length },
        { id: "test-requests", label: "Test Requests", badge: null },
        { id: "lab-reports", label: "Lab Reports", badge: null },
        { id: "diagnostic-services", label: "Diagnostic Services", badge: null },
      ],
    },
    {
      title: "11. Billing & Finance",
      items: [
        { id: "billing-dashboard", label: "Billing Dashboard", badge: billing.length },
        { id: "invoices", label: "Invoices", badge: null },
        { id: "payments", label: "Payments", badge: null },
        { id: "refunds", label: "Refunds", badge: null },
        { id: "pricing", label: "Pricing", badge: null },
        { id: "financial-reports", label: "Financial Reports", badge: null },
      ],
    },
    {
      title: "12. Pharmacy & Inventory",
      items: [
        { id: "medicines", label: "Medicines", badge: null },
        { id: "stock-management", label: "Stock Management", badge: null },
        { id: "suppliers", label: "Suppliers", badge: null },
        { id: "purchase-orders", label: "Purchase Orders", badge: null },
        { id: "expiry-tracking", label: "Expiry Tracking", badge: null },
      ],
    },
    {
      title: "13. Communication",
      items: [
        { id: "notifications", label: "Notifications", badge: null },
        { id: "email-management", label: "Email Management", badge: null },
        { id: "sms-management", label: "SMS Management", badge: null },
        { id: "announcements", label: "Announcements", badge: null },
      ],
    },
    {
      title: "14. Feedback & Complaints",
      items: [
        { id: "patient-reviews", label: "Patient Reviews", badge: null },
        { id: "doctor-reviews", label: "Doctor Reviews", badge: null },
        { id: "complaints", label: "Complaints", badge: null },
        { id: "support-tickets", label: "Support Tickets", badge: null },
      ],
    },
    {
      title: "15. Reports & Analytics",
      items: [
        { id: "patient-reports", label: "Patient Reports", badge: null },
        { id: "doctor-reports", label: "Doctor Reports", badge: null },
        { id: "appointment-reports", label: "Appointment Reports", badge: null },
        { id: "financial-analytics", label: "Financial Reports", badge: null },
        { id: "operational-analytics", label: "Operational Analytics", badge: null },
      ],
    },
    {
      title: "16. System Management",
      items: [
        { id: "user-management", label: "User Management", badge: null },
        { id: "system-permissions", label: "Roles & Permissions", badge: null },
        { id: "system-settings", label: "System Settings", badge: null },
        { id: "document-templates", label: "Document Templates", badge: null },
      ],
    },
    {
      title: "17. Security & Audit",
      items: [
        { id: "audit-logs", label: "Audit Logs", badge: auditLogs.length },
        { id: "login-history", label: "Login History", badge: null },
        { id: "access-logs", label: "Access Logs", badge: null },
        { id: "security-incidents", label: "Security Incidents", badge: "0" },
      ],
    },
    {
      title: "18. Data Management",
      items: [
        { id: "database-backup", label: "Database Backup", badge: "Auto" },
        { id: "recovery", label: "Recovery", badge: null },
        { id: "data-import", label: "Data Import", badge: null },
        { id: "data-export", label: "Data Export", badge: null },
      ],
    },
    {
      title: "19. Support",
      items: [
        { id: "helpdesk", label: "Helpdesk", badge: null },
        { id: "faqs", label: "FAQs", badge: null },
        { id: "contact-support", label: "Contact Support", badge: null },
      ],
    },
    {
      title: "20. Account",
      items: [
        { id: "admin-profile", label: "Admin Profile", badge: null },
        { id: "account-settings", label: "Settings", badge: null },
      ],
    },
    {
      title: "21. Exit",
      items: [
        { id: "logout", label: "Logout", badge: null },
      ],
    },
  ];

  return (
    <section className="subpage admin-dashboard" style={{ paddingTop: "20px" }}>
      <div className="container" style={{ maxWidth: "1440px" }}>
        {/* Full-Height Layout: Dark Green Sidebar on the Left starting from the Top */}
        <div className="portal-grid-layout" style={{ marginTop: 0 }}>
          {/* Left Sidebar Column */}
          <div className="portal-sidebar-column">
            <aside className="portal-sidebar-card dark-green-sidebar">
            <div className="portal-user-profile-box">
              <div className="portal-user-avatar">
                {(user?.firstName || "S")[0].toUpperCase()}
              </div>
              <div className="portal-user-info">
                <h4 className="portal-user-name">{user?.firstName} {user?.lastName}</h4>
                <span className="portal-user-role-badge">ADMIN</span>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="portal-search-input"
                placeholder="Search administration..."
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value)}
              />
            </div>

            <nav aria-label="Admin console navigation">
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
                                  navigate(`/admin/${item.id}`, { preventScrollReset: true });
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
                  Platform Security, Credentials &amp; Audit Governance
                </p>
                <h1 className="portal-hero-title">
                  Admin <span>Console</span>
                </h1>
                <p className="portal-hero-lede">
                  Administrative oversight across physicians, departments, clinical staff, billing invoices, and cryptographic audit logs under zero-trust privacy governance.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <span className="portal-hero-badge">
                  <strong>Role:</strong> ADMIN
                </span>
                <span className="portal-hero-badge" style={{ background: "rgba(52, 211, 153, 0.25)", borderColor: "#34D399" }}>
                  <CheckIcon size={14} /> Security Status: Enforced
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
                <span className="stats-icon"><DoctorIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">{doctors.length} Doctors</strong>
                  <span className="stats-label">Registered Physicians</span>
                </div>
                <span className="stats-divider" aria-hidden="true" />
              </div>

              <div className="stats-item">
                <span className="stats-icon"><HospitalIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">{departments.length} Departments</strong>
                  <span className="stats-label">Clinical Units</span>
                </div>
                <span className="stats-divider" aria-hidden="true" />
              </div>

              <div className="stats-item">
                <span className="stats-icon"><UsersIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">{staff.length} Staff</strong>
                  <span className="stats-label">Active Employees</span>
                </div>
                <span className="stats-divider" aria-hidden="true" />
              </div>

              <div className="stats-item">
                <span className="stats-icon"><AuditIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">{auditLogs.length} Events</strong>
                  <span className="stats-label">Immutable Audit Trail</span>
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
                      <h2 style={{ margin: "0 0 6px", color: "var(--color-primary)" }}>Platform Administration Center</h2>
                      <p style={{ margin: 0, color: "var(--color-text-body)" }}>
                        Full governance over clinical operations, staff roles, departments, billing, and system compliance.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" }}>
                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Total Revenue</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>
                        ₹{billing.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>{billing.length} Invoices issued</p>
                    </div>

                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Physician Verification</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>
                        {doctors.filter(d => d.verifiedByAdmin).length} of {doctors.length} Verified
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>Accreditation active</p>
                    </div>

                    <div style={{ padding: "16px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--color-sage)", fontWeight: 700 }}>Security Status</span>
                      <h4 style={{ margin: "6px 0", color: "var(--color-primary)" }}>Enforced</h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-body)" }}>Zero-Trust medical vault</p>
                    </div>
                  </div>
                </div>

                {/* Audit Logs Summary */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header">
                    <h3 style={{ margin: 0, color: "var(--color-primary)" }}>Recent Immutable Audit Events</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab("audit-logs"); navigate("/admin/audit-logs"); }}>
                      View Full Trail
                    </button>
                  </div>
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Action</th>
                          <th>Entity</th>
                          <th>Details</th>
                          <th>IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.slice(0, 5).map((log) => (
                          <tr key={log.id}>
                            <td>{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : "Recent"}</td>
                            <td><code>{log.action}</code></td>
                            <td>{log.entityType} #{log.entityId || "N/A"}</td>
                            <td>{log.details}</td>
                            <td><small>{log.ipAddress}</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* View: Doctor Management */}
            {(activeTab === "all-doctors" || activeTab === "add-doctor" || activeTab === "doctor-verification" || activeTab === "doctor-performance") && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header">
                    <div>
                      <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Physician Roster &amp; Verification</h3>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                        Verify doctor credentials and medical licenses before authorizing clinical practice.
                      </p>
                    </div>
                  </div>

                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Doctor ID</th>
                          <th>Specialisation</th>
                          <th>Licence</th>
                          <th>Experience</th>
                          <th>Status</th>
                          <th>Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.map((doc) => (
                          <tr key={doc.id}>
                            <td><strong>DOC-{doc.id}</strong></td>
                            <td>{doc.specialisation}</td>
                            <td><code>{doc.licenceNumber}</code></td>
                            <td>{doc.experienceYears} Years</td>
                            <td>
                              <span className={`status-badge-pill status-${doc.verifiedByAdmin ? "verified" : "pending"}`}>
                                {doc.verifiedByAdmin ? "Verified" : "Pending Verification"}
                              </span>
                            </td>
                            <td>
                              {!doc.verifiedByAdmin ? (
                                <button className="btn btn-primary btn-sm" onClick={() => handleVerifyDoctor(doc.id)}>
                                  <CheckIcon size={14} /> Verify Doctor
                                </button>
                              ) : (
                                <span style={{ fontSize: "0.85rem", color: "var(--color-sage)" }}>Verified by Admin</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Provision Doctor Account Form */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Provision New Doctor Account</h3>
                  <form onSubmit={handleAddDoctor} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label>
                      First Name *
                      <input
                        type="text"
                        required
                        value={newDoctor.firstName}
                        onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                        placeholder="e.g. Dr. Sarah"
                      />
                    </label>
                    <label>
                      Last Name *
                      <input
                        type="text"
                        required
                        value={newDoctor.lastName}
                        onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                        placeholder="e.g. Jenkins"
                      />
                    </label>
                    <label>
                      Login Email Address *
                      <input
                        type="email"
                        required
                        value={newDoctor.email}
                        onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                        placeholder="doctor@healthcure.local"
                      />
                    </label>
                    <label>
                      Medical Specialisation
                      <input
                        type="text"
                        required
                        value={newDoctor.specialisation}
                        onChange={(e) => setNewDoctor({ ...newDoctor, specialisation: e.target.value })}
                        placeholder="e.g. Neurology, Pediatrics"
                      />
                    </label>
                    <label>
                      Medical Licence Number *
                      <input
                        type="text"
                        required
                        value={newDoctor.licenceNumber}
                        onChange={(e) => setNewDoctor({ ...newDoctor, licenceNumber: e.target.value })}
                        placeholder="e.g. MED-LIC-2026"
                      />
                    </label>
                    <label>
                      Qualifications
                      <input
                        type="text"
                        required
                        value={newDoctor.qualification}
                        onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                        placeholder="e.g. MD, Johns Hopkins"
                      />
                    </label>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <button type="submit" className="btn btn-primary">
                        Provision Physician Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View: Departments */}
            {(activeTab === "all-departments" || activeTab === "add-department" || activeTab === "specializations" || activeTab === "department-assignments") && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Clinical Departments</h3>
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Department Name</th>
                          <th>Head Physician</th>
                          <th>Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((dept) => (
                          <tr key={dept.id}>
                            <td><strong>{dept.name}</strong></td>
                            <td>{dept.head_doctor_name || "Unassigned"}</td>
                            <td>{dept.description}</td>
                            <td>
                              <span className="status-badge-pill status-active">Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Department Form */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Create Clinical Department</h3>
                  <form onSubmit={handleAddDepartment} style={{ display: "grid", gap: "14px" }}>
                    <label>
                      Department Name *
                      <input
                        type="text"
                        required
                        placeholder="e.g. Endocrinology & Metabolism"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      />
                    </label>
                    <label>
                      Head Physician Name
                      <input
                        type="text"
                        placeholder="e.g. Dr. Sarah Jenkins"
                        value={newDepartment.headDoctorName}
                        onChange={(e) => setNewDepartment({ ...newDepartment, headDoctorName: e.target.value })}
                      />
                    </label>
                    <label>
                      Scope &amp; Description
                      <textarea
                        rows={2}
                        placeholder="Clinical scope, diagnostic equipment, and inpatient/outpatient coverage..."
                        value={newDepartment.description}
                        onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                      />
                    </label>
                    <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                      Create Department
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* View: Staff Management */}
            {(activeTab === "all-staff" || activeTab === "add-staff" || activeTab === "roles-permissions" || activeTab === "attendance" || activeTab === "leave-management") && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Clinical Staff Roster</h3>
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Employee ID</th>
                          <th>Name</th>
                          <th>Role Group</th>
                          <th>Department</th>
                          <th>Email / Phone</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((s) => (
                          <tr key={s.id}>
                            <td><code>{s.employee_id}</code></td>
                            <td><strong>{s.name}</strong></td>
                            <td>{s.role_group}</td>
                            <td>{s.department_name || "General"}</td>
                            <td>{s.email}<br /><small>{s.phone}</small></td>
                            <td>
                              <span className="status-badge-pill status-active">Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Staff Form */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Register Staff Member</h3>
                  <form onSubmit={handleAddStaff} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label>
                      Employee ID *
                      <input
                        type="text"
                        required
                        value={newStaff.employeeId}
                        onChange={(e) => setNewStaff({ ...newStaff, employeeId: e.target.value })}
                      />
                    </label>
                    <label>
                      Full Name *
                      <input
                        type="text"
                        required
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        placeholder="e.g. Clara Oswald"
                      />
                    </label>
                    <label>
                      Email Address *
                      <input
                        type="email"
                        required
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        placeholder="clara@healthcure.local"
                      />
                    </label>
                    <label>
                      Role Group
                      <select
                        value={newStaff.roleGroup}
                        onChange={(e) => setNewStaff({ ...newStaff, roleGroup: e.target.value })}
                      >
                        <option value="Receptionist">Receptionist</option>
                        <option value="Nurse Coordinator">Nurse Coordinator</option>
                        <option value="Laboratory Technician">Laboratory Technician</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Billing Administrator">Billing Administrator</option>
                      </select>
                    </label>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <button type="submit" className="btn btn-primary">
                        Register Employee
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View: Laboratory & Diagnostics Management */}
            {(activeTab === "test-management" || activeTab === "test-requests" || activeTab === "lab-reports" || activeTab === "diagnostic-services") && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Diagnostic Test Catalog</h3>
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Test Name</th>
                          <th>Category</th>
                          <th>Price (₹ INR)</th>
                          <th>Preparation</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labTests.map((t) => (
                          <tr key={t.id}>
                            <td><strong>{t.name}</strong></td>
                            <td>{t.category}</td>
                            <td>₹{t.price.toFixed(2)}</td>
                            <td><small>{t.preparation_instructions}</small></td>
                            <td>
                              <span className="status-badge-pill status-active">Available</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Diagnostic Test Form */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Add Diagnostic Test to Catalog</h3>
                  <form onSubmit={handleAddLabTest} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label>
                      Test Name *
                      <input
                        type="text"
                        required
                        value={newLabTest.name}
                        onChange={(e) => setNewLabTest({ ...newLabTest, name: e.target.value })}
                        placeholder="e.g. Thyroid Stimulating Hormone (TSH)"
                      />
                    </label>
                    <label>
                      Category
                      <input
                        type="text"
                        required
                        value={newLabTest.category}
                        onChange={(e) => setNewLabTest({ ...newLabTest, category: e.target.value })}
                        placeholder="e.g. Endocrinology"
                      />
                    </label>
                    <label>
                      Price ($) *
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newLabTest.price}
                        onChange={(e) => setNewLabTest({ ...newLabTest, price: e.target.value })}
                      />
                    </label>
                    <label>
                      Preparation Instructions
                      <input
                        type="text"
                        value={newLabTest.preparationInstructions}
                        onChange={(e) => setNewLabTest({ ...newLabTest, preparationInstructions: e.target.value })}
                        placeholder="e.g. Fasting 8 hours"
                      />
                    </label>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <button type="submit" className="btn btn-primary">
                        Add to Laboratory Catalog
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View: Appointments Management */}
            {(activeTab === "all-appointments" || activeTab === "appointment-calendar" || activeTab === "pending-requests" || activeTab === "appointment-history") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Platform Appointments Oversight</h3>
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
                                {isAttended ? "✓ Attended" : isMissed ? "✗ Missed" : a.status}
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
                                  onClick={() => setSelectedAdminAppt(a)}
                                >
                                  👁 Details
                                </button>
                                {a.status !== "CONFIRMED" && (
                                  <button className="btn btn-primary btn-sm" style={{ padding: "4px 8px", fontSize: "0.8rem" }} onClick={() => handleUpdateAppointmentStatus(a.id, "CONFIRMED")}>
                                    Confirm
                                  </button>
                                )}
                                {a.status !== "COMPLETED" && a.status !== "ATTENDED" && (
                                  <button className="btn btn-secondary btn-sm" style={{ padding: "4px 8px", fontSize: "0.8rem" }} onClick={() => handleUpdateAppointmentStatus(a.id, "COMPLETED")}>
                                    Complete
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
              </div>
            )}

            {/* View: Billing & Finance */}
            {(activeTab === "billing-dashboard" || activeTab === "invoices" || activeTab === "payments" || activeTab === "refunds" || activeTab === "pricing" || activeTab === "financial-reports") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Platform Financials &amp; Invoices</h3>
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Patient</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.map((inv) => (
                        <tr key={inv.id}>
                          <td><code>{inv.invoice_number}</code></td>
                          <td>{inv.first_name} {inv.last_name}</td>
                          <td>{inv.description}</td>
                          <td><strong>₹{inv.amount.toFixed(2)}</strong></td>
                          <td>
                            <span className={`status-badge-pill status-${inv.status?.toLowerCase()}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td>{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "Recent"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View: System Settings */}
            {(activeTab === "system-settings" || activeTab === "account-settings" || activeTab === "document-templates") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Platform Configuration &amp; Governance</h3>
                <form onSubmit={handleSaveSettings} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label>
                    Healthcare Center Name
                    <input
                      type="text"
                      value={settingsForm.center_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, center_name: e.target.value })}
                    />
                  </label>
                  <label>
                    Emergency Phone Line
                    <input
                      type="text"
                      value={settingsForm.emergency_phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, emergency_phone: e.target.value })}
                    />
                  </label>
                  <label>
                    Consultation Buffer (Minutes)
                    <input
                      type="number"
                      value={settingsForm.consultation_buffer_minutes}
                      onChange={(e) => setSettingsForm({ ...settingsForm, consultation_buffer_minutes: e.target.value })}
                    />
                  </label>
                  <label>
                    Medical Record Retention (Years)
                    <input
                      type="number"
                      value={settingsForm.record_retention_years}
                      onChange={(e) => setSettingsForm({ ...settingsForm, record_retention_years: e.target.value })}
                    />
                  </label>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button type="submit" className="btn btn-primary">
                      Save Platform Configurations
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* View: Security & Audit Logs */}
            {(activeTab === "audit-logs" || activeTab === "login-history" || activeTab === "access-logs" || activeTab === "security-incidents") && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <div className="portal-card-header">
                  <div>
                    <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Immutable Cryptographic Audit Trail</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                      Every authentication, document access, and clinical authorization event is recorded for compliance.
                    </p>
                  </div>
                </div>
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Details</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>#{log.id}</td>
                          <td>USR-{log.userId}</td>
                          <td><code>{log.action}</code></td>
                          <td>{log.entityType} #{log.entityId || "N/A"}</td>
                          <td>{log.details}</td>
                          <td><small>{log.ipAddress}</small></td>
                          <td><small>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "Recent"}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Generic Fallback for Remaining Admin Tabs */}
            {![
              "dashboard",
              "all-doctors", "add-doctor", "doctor-verification", "doctor-performance",
              "all-departments", "add-department", "specializations", "department-assignments",
              "all-staff", "add-staff", "roles-permissions", "attendance", "leave-management",
              "test-management", "test-requests", "lab-reports", "diagnostic-services",
              "all-appointments", "appointment-calendar", "pending-requests", "appointment-history",
              "billing-dashboard", "invoices", "payments", "refunds", "pricing", "financial-reports",
              "system-settings", "account-settings", "document-templates",
              "audit-logs", "login-history", "access-logs", "security-incidents"
            ].includes(activeTab) && (
              <div className="panel-form-card" style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>
                  {menuCategories.flatMap(g => g.items).find(i => i.id === activeTab)?.label || "Administration Section"}
                </h3>
                <p style={{ color: "var(--color-text-body)" }}>
                  This operational module is managed in compliance with Health &amp; Cure administrative and HIPAA zero-trust guidelines.
                </p>
                <div style={{ padding: "20px", background: "var(--color-bg-tint)", borderRadius: "var(--radius-md)", marginTop: "16px" }}>
                  <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--color-text-body)" }}>
                    Records and configurations are synced with the central PostgreSQL database. Real-time audit logs are maintained for every query.
                  </p>
                </div>
              </div>
            )}
            </main>
          </div>
        </div>
      </div>

      {/* Admin Appointment Details Inspection Modal */}
      {selectedAdminAppt && (
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
          onClick={() => setSelectedAdminAppt(null)}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--color-border-subtle)", background: "#F8FAF9" }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--color-primary)", fontSize: "1.3rem" }}>
                  Platform Appointment Inspection
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Reference: <code>{selectedAdminAppt.referenceCode}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdminAppt(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}
              >
                <CloseIcon size={22} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ background: "var(--color-bg-tint)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--color-border-card)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Patient Name</span>
                  <strong style={{ fontSize: "1.1rem", color: "var(--color-primary)" }}>{selectedAdminAppt.patientName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Attendance / Status</span>
                  <span
                    className="status-badge-pill"
                    style={{
                      background: selectedAdminAppt.status === "ATTENDED" ? "#ECFDF5" : selectedAdminAppt.status === "NOT_ATTENDED" ? "#FEF2F2" : "#EFF6FF",
                      color: selectedAdminAppt.status === "ATTENDED" ? "#065F46" : selectedAdminAppt.status === "NOT_ATTENDED" ? "#991B1B" : "#1E40AF",
                      border: `1px solid ${selectedAdminAppt.status === "ATTENDED" ? "#10B981" : selectedAdminAppt.status === "NOT_ATTENDED" ? "#EF4444" : "#3B82F6"}`,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      display: "inline-block",
                    }}
                  >
                    {selectedAdminAppt.status === "ATTENDED" ? "✓ Attended" : selectedAdminAppt.status === "NOT_ATTENDED" ? "✗ Missed / Not Attended" : selectedAdminAppt.status}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Email</span>
                  <strong>{selectedAdminAppt.patientEmail}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Phone</span>
                  <strong>{selectedAdminAppt.patientPhone}</strong>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#FFFFFF", border: "1px solid var(--color-border-subtle)", padding: "14px 18px", borderRadius: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Department</span>
                  <strong>{selectedAdminAppt.specialty}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Attending Doctor</span>
                  <strong>{selectedAdminAppt.preferredDoctor || "Assigned Specialist"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Time Slot</span>
                  <strong>{selectedAdminAppt.timeSlot}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Consultation Mode</span>
                  <strong>{selectedAdminAppt.consultationType}</strong>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Patient Demographics (Gender / Blood Group / DOB)</span>
                  <span>{selectedAdminAppt.patientGender || "Female"} • Blood: <strong style={{ color: "#DC2626" }}>{selectedAdminAppt.patientBloodGroup || "A+"}</strong> • DOB: {selectedAdminAppt.patientDob || "2003-06-12"}</span>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Address &amp; Emergency Contact</span>
                  <span>{selectedAdminAppt.patientAddress || "Health & Cure Super Speciality Hospital Campus, Salt Lake Sector V, Kolkata, West Bengal - 700091, India"} • Emergency: {selectedAdminAppt.emergencyContact || selectedAdminAppt.patientPhone || "+91 9051579029"}</span>
                </div>
                {selectedAdminAppt.notes && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block" }}>Patient Symptoms / Booking Notes</span>
                    <p style={{ margin: "4px 0 0", color: "var(--color-text-body)", fontSize: "0.9rem" }}>{selectedAdminAppt.notes}</p>
                  </div>
                )}
              </div>

              {selectedAdminAppt.diagnosisTitle && (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #34D399", padding: "16px 20px", borderRadius: "12px" }}>
                  <strong style={{ color: "#065F46", fontSize: "0.95rem" }}>Published Diagnosis &amp; Prescriptions:</strong>
                  <p style={{ margin: "4px 0 6px", fontWeight: 700, color: "var(--color-primary)" }}>{selectedAdminAppt.diagnosisTitle}</p>
                  {selectedAdminAppt.clinicalNotes && <p style={{ margin: "0 0 4px", fontSize: "0.88rem" }}><strong>Clinical Notes:</strong> {selectedAdminAppt.clinicalNotes}</p>}
                  {selectedAdminAppt.prescriptions && <p style={{ margin: "0 0 4px", fontSize: "0.88rem" }}><strong>Rx:</strong> {selectedAdminAppt.prescriptions}</p>}
                  {selectedAdminAppt.followUpNotes && <p style={{ margin: 0, fontSize: "0.88rem" }}><strong>Follow-Up:</strong> {selectedAdminAppt.followUpNotes}</p>}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "12px", borderTop: "1px solid var(--color-border-subtle)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAdminAppt(null)}
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
