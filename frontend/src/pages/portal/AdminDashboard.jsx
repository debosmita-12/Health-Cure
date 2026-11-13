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

  // Doctor & Patient Management Modals & Filters
  const [editDoctorModal, setEditDoctorModal] = useState(null);
  const [deleteDoctorModal, setDeleteDoctorModal] = useState(null);
  const [editPatientModal, setEditPatientModal] = useState(null);
  const [deletePatientModal, setDeletePatientModal] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");

  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "Patient@123",
    gender: "Other",
    bloodGroup: "O+",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
  });

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

  async function handleUpdateDoctor(e) {
    e.preventDefault();
    if (!editDoctorModal) return;
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.put(`/api/admin/doctors/${editDoctorModal.id}`, editDoctorModal);
      setActionMessage(res.data?.message || "Doctor record maintained successfully.");
      setEditDoctorModal(null);
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to update doctor record.");
    }
  }

  async function handleDeleteDoctor() {
    if (!deleteDoctorModal) return;
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.delete(`/api/admin/doctors/${deleteDoctorModal.id}`);
      setActionMessage(res.data?.message || "Doctor record permanently deleted.");
      setDeleteDoctorModal(null);
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to delete doctor record.");
    }
  }

  async function handleAddPatient(e) {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.post("/api/admin/patients", newPatient);
      setActionMessage(res.data?.message || "Patient provisioned successfully.");
      setNewPatient({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "Patient@123",
        gender: "Other",
        bloodGroup: "O+",
        dateOfBirth: "",
        address: "",
        emergencyContact: "",
      });
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to provision patient account.");
    }
  }

  async function handleUpdatePatient(e) {
    e.preventDefault();
    if (!editPatientModal) return;
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.put(`/api/admin/patients/${editPatientModal.id}`, editPatientModal);
      setActionMessage(res.data?.message || "Patient record maintained successfully.");
      setEditPatientModal(null);
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to update patient record.");
    }
  }

  async function handleDeletePatient() {
    if (!deletePatientModal) return;
    setActionMessage("");
    setErrorMessage("");
    try {
      const res = await api.delete(`/api/admin/patients/${deletePatientModal.id}`);
      setActionMessage(res.data?.message || "Patient record permanently deleted.");
      setDeletePatientModal(null);
      loadDashboard();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to delete patient record.");
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
  const patients = data?.patients || [];
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
        { id: "doctor-verification", label: "Doctor Verification", badge: doctors.filter(d => !d.verifiedByAdmin && !d.verified_by_admin).length || "All OK" },
        { id: "doctor-performance", label: "Doctor Performance", badge: null },
      ],
    },
    {
      title: "3. Patient Management",
      items: [
        { id: "all-patients", label: "All Patients", badge: patients.length || null },
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
                <span className="stats-icon"><UsersIcon size={24} /></span>
                <div className="stats-content">
                  <strong className="stats-value">{patients.length} Patients</strong>
                  <span className="stats-label">Registered Patients</span>
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
                  <div className="portal-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Physician Roster, Maintenance &amp; Deletion</h3>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                        Admin governance over doctors: verify credentials, maintain practice profiles, and delete inactive records.
                      </p>
                    </div>
                    <div style={{ width: "320px", maxWidth: "100%" }}>
                      <input
                        type="text"
                        placeholder="Search doctor name, license, specialty..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        style={{ width: "100%", padding: "9px 14px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", fontSize: "0.9rem" }}
                      />
                    </div>
                  </div>

                  <div className="portal-table-wrap" style={{ marginTop: "16px" }}>
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Doctor ID</th>
                          <th>Physician Name</th>
                          <th>Specialisation &amp; Dept</th>
                          <th>Licence</th>
                          <th>Experience &amp; Fee</th>
                          <th>Contact</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors
                          .filter((doc) => {
                            if (!doctorSearch.trim()) return true;
                            const q = doctorSearch.toLowerCase();
                            const name = `${doc.first_name || doc.firstName || ""} ${doc.last_name || doc.lastName || ""}`.toLowerCase();
                            const spec = (doc.specialisation || "").toLowerCase();
                            const lic = (doc.licence_number || doc.licenceNumber || "").toLowerCase();
                            const email = (doc.email || "").toLowerCase();
                            const dept = (doc.department_name || doc.departmentName || "").toLowerCase();
                            return name.includes(q) || spec.includes(q) || lic.includes(q) || email.includes(q) || dept.includes(q);
                          })
                          .map((doc) => {
                            const isVerified = doc.verifiedByAdmin ?? doc.verified_by_admin ?? false;
                            const fullName = `Dr. ${(doc.first_name || doc.firstName || "").replace(/^Dr\.?\s*/i, "")} ${doc.last_name || doc.lastName || ""}`.trim();
                            const lic = doc.licence_number || doc.licenceNumber || "N/A";
                            const exp = doc.experience_years || doc.experienceYears || 0;
                            const fee = doc.consultation_fee || doc.consultationFee || 750;
                            const dept = doc.department_name || doc.departmentName || doc.specialisation || "General";

                            return (
                              <tr key={doc.id}>
                                <td><strong>DOC-{doc.id}</strong></td>
                                <td>
                                  <strong>{fullName}</strong>
                                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{doc.qualification || "MBBS"}</div>
                                </td>
                                <td>
                                  <span>{doc.specialisation || "General"}</span>
                                  <div style={{ fontSize: "0.78rem", color: "var(--color-sage)" }}>Dept: {dept}</div>
                                </td>
                                <td><code>{lic}</code></td>
                                <td>
                                  <div>₹{Number(fee).toFixed(0)}</div>
                                  <small style={{ color: "var(--color-text-muted)" }}>{exp} yrs exp</small>
                                </td>
                                <td>
                                  <div style={{ fontSize: "0.85rem" }}>{doc.email}</div>
                                  <small style={{ color: "var(--color-text-muted)" }}>{doc.phone || "On File"}</small>
                                </td>
                                <td>
                                  <span className={`status-badge-pill status-${isVerified ? "verified" : "pending"}`}>
                                    {isVerified ? "Verified" : "Pending"}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                                    {!isVerified && (
                                      <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                                        onClick={() => handleVerifyDoctor(doc.id)}
                                        title="Verify physician credentials"
                                      >
                                        <CheckIcon size={12} /> Verify
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                                      onClick={() =>
                                        setEditDoctorModal({
                                          ...doc,
                                          firstName: (doc.first_name || doc.firstName || "").replace(/^Dr\.?\s*/i, ""),
                                          lastName: doc.last_name || doc.lastName || "",
                                          licenceNumber: doc.licence_number || doc.licenceNumber || "",
                                          phone: doc.phone || "",
                                          specialisation: doc.specialisation || "",
                                          qualification: doc.qualification || "",
                                          experienceYears: doc.experience_years || doc.experienceYears || 0,
                                          consultationFee: doc.consultation_fee || doc.consultationFee || 750,
                                          hospitalAffiliation: doc.hospital_affiliation || doc.hospitalAffiliation || "",
                                          isAvailable: doc.is_available ?? doc.isAvailable ?? true,
                                        })
                                      }
                                      title="Maintain doctor record"
                                    >
                                      ✏️ Maintain
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm"
                                      style={{
                                        padding: "4px 10px",
                                        fontSize: "0.78rem",
                                        background: "#FEE2E2",
                                        color: "#DC2626",
                                        border: "1px solid #F87171",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => setDeleteDoctorModal(doc)}
                                      title="Delete doctor record permanently"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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
                        placeholder="e.g. Sarah"
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

            {/* View: Patient Management */}
            {(activeTab === "all-patients" || activeTab === "register-patient" || activeTab === "patient-history" || activeTab === "patient-requests") && (
              <div style={{ display: "grid", gap: "24px" }}>
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <div className="portal-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px", color: "var(--color-primary)" }}>Patient Roster, Maintenance &amp; Deletion</h3>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-body)" }}>
                        Admin governance over registered patients: inspect credentials, maintain demographic records, and delete patient accounts.
                      </p>
                    </div>
                    <div style={{ width: "320px", maxWidth: "100%" }}>
                      <input
                        type="text"
                        placeholder="Search patient name, email, phone, blood group..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        style={{ width: "100%", padding: "9px 14px", borderRadius: "8px", border: "1px solid var(--color-border-subtle)", fontSize: "0.9rem" }}
                      />
                    </div>
                  </div>

                  <div className="portal-table-wrap" style={{ marginTop: "16px" }}>
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>Patient ID</th>
                          <th>Patient Name</th>
                          <th>Contact (Email / Phone)</th>
                          <th>Demographics</th>
                          <th>Date of Birth</th>
                          <th>Consultations</th>
                          <th>Address &amp; Emergency</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients
                          .filter((p) => {
                            if (!patientSearch.trim()) return true;
                            const q = patientSearch.toLowerCase();
                            const name = `${p.first_name || p.firstName || ""} ${p.last_name || p.lastName || ""}`.toLowerCase();
                            const email = (p.email || "").toLowerCase();
                            const phone = (p.phone || "").toLowerCase();
                            const blood = (p.blood_group || p.bloodGroup || "").toLowerCase();
                            const gender = (p.gender || "").toLowerCase();
                            return name.includes(q) || email.includes(q) || phone.includes(q) || blood.includes(q) || gender.includes(q);
                          })
                          .map((p) => {
                            const fullName = `${p.first_name || p.firstName || ""} ${p.last_name || p.lastName || ""}`.trim() || "Registered Patient";
                            const blood = p.blood_group || p.bloodGroup || "O+";
                            const gender = p.gender || "Other";
                            const dob = p.date_of_birth || p.dateOfBirth || "N/A";
                            const apptCount = p.total_appointments || p.appointmentCount || 0;
                            const address = p.address || "On File";
                            const emerg = p.emergency_contact || p.emergencyContact || p.phone || "On File";

                            return (
                              <tr key={p.id}>
                                <td><strong>PAT-{p.id}</strong></td>
                                <td>
                                  <strong>{fullName}</strong>
                                </td>
                                <td>
                                  <div style={{ fontSize: "0.85rem" }}>{p.email}</div>
                                  <small style={{ color: "var(--color-text-muted)" }}>{p.phone || "On File"}</small>
                                </td>
                                <td>
                                  <span>{gender}</span> • <strong style={{ color: "#DC2626" }}>{blood}</strong>
                                </td>
                                <td>{dob}</td>
                                <td>
                                  <span className="status-badge-pill" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                                    {apptCount} Consultations
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: "0.82rem", maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={address}>
                                    {address}
                                  </div>
                                  <small style={{ color: "var(--color-text-muted)" }}>Emerg: {emerg}</small>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                                      onClick={() =>
                                        setEditPatientModal({
                                          ...p,
                                          firstName: p.first_name || p.firstName || "",
                                          lastName: p.last_name || p.lastName || "",
                                          phone: p.phone || "",
                                          gender: p.gender || "Other",
                                          bloodGroup: p.blood_group || p.bloodGroup || "O+",
                                          dateOfBirth: p.date_of_birth || p.dateOfBirth || "",
                                          address: p.address || "",
                                          emergencyContact: p.emergency_contact || p.emergencyContact || "",
                                        })
                                      }
                                      title="Maintain patient profile"
                                    >
                                      ✏️ Maintain
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm"
                                      style={{
                                        padding: "4px 10px",
                                        fontSize: "0.78rem",
                                        background: "#FEE2E2",
                                        color: "#DC2626",
                                        border: "1px solid #F87171",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => setDeletePatientModal(p)}
                                      title="Delete patient record permanently"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Provision Patient Account Form */}
                <div className="panel-form-card" style={{ padding: "28px" }}>
                  <h3 style={{ margin: "0 0 16px", color: "var(--color-primary)" }}>Provision New Patient Account</h3>
                  <form onSubmit={handleAddPatient} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <label>
                      First Name *
                      <input
                        type="text"
                        required
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                        placeholder="e.g. Debosmita"
                      />
                    </label>
                    <label>
                      Last Name *
                      <input
                        type="text"
                        required
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                        placeholder="e.g. Mukhopadhyay"
                      />
                    </label>
                    <label>
                      Login Email Address *
                      <input
                        type="email"
                        required
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                        placeholder="patient@healthcure.local"
                      />
                    </label>
                    <label>
                      Phone Number *
                      <input
                        type="text"
                        required
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </label>
                    <label>
                      Temporary Password *
                      <input
                        type="text"
                        required
                        value={newPatient.password}
                        onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
                        placeholder="Patient@123"
                      />
                    </label>
                    <label>
                      Gender
                      <select
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label>
                      Blood Group
                      <select
                        value={newPatient.bloodGroup}
                        onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </label>
                    <label>
                      Date of Birth
                      <input
                        type="date"
                        value={newPatient.dateOfBirth}
                        onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                      />
                    </label>
                    <label>
                      Emergency Contact Phone
                      <input
                        type="text"
                        value={newPatient.emergencyContact}
                        onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                        placeholder="+91 9051579029"
                      />
                    </label>
                    <label style={{ gridColumn: "1 / -1" }}>
                      Residential Address
                      <input
                        type="text"
                        value={newPatient.address}
                        onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                        placeholder="Full street address, city, pin code..."
                      />
                    </label>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <button type="submit" className="btn btn-primary">
                        Provision Patient Account
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
              "all-patients", "register-patient", "patient-history", "patient-requests",
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
      {/* Edit Doctor Modal */}
      {editDoctorModal && (
        <div
          className="portal-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={() => setEditDoctorModal(null)}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--color-border-subtle)", background: "#F8FAF9" }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--color-primary)", fontSize: "1.25rem" }}>
                  Maintain Doctor Record
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Editing DOC-{editDoctorModal.id} • {editDoctorModal.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditDoctorModal(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}
              >
                <CloseIcon size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  First Name *
                  <input
                    type="text"
                    required
                    value={editDoctorModal.firstName || ""}
                    onChange={(e) => setEditDoctorModal({ ...editDoctorModal, firstName: e.target.value })}
                  />
                </label>
                <label>
                  Last Name *
                  <input
                    type="text"
                    required
                    value={editDoctorModal.lastName || ""}
                    onChange={(e) => setEditDoctorModal({ ...editDoctorModal, lastName: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Contact Phone
                  <input
                    type="text"
                    value={editDoctorModal.phone || ""}
                    onChange={(e) => setEditDoctorModal({ ...editDoctorModal, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </label>
                <label>
                  Medical Licence Number *
                  <input
                    type="text"
                    required
                    value={editDoctorModal.licenceNumber || ""}
                    onChange={(e) => setEditDoctorModal({ ...editDoctorModal, licenceNumber: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Specialisation *
                  <input
                    type="text"
                    required
                    value={editDoctorModal.specialisation || ""}
                    onChange={(e) => setEditDoctorModal({ ...editDoctorModal, specialisation: e.target.value })}
                  />
                </label>
                <label>
                  Qualifications *
                  <input
                    type="text"
                    required
                    value={editDoctorModal.qualification || ""}
                    onChange={(e) => setEditDoctorModal({ ...editDoctorModal, qualification: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Experience (Years) *
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={editDoctorModal.experienceYears ?? 5}
                    onChange={(e) => setEditDoctorModal({ ...editDoctorModal, experienceYears: parseInt(e.target.value) || 0 })}
                  />
                </label>
                <label>
                  Consultation Fee (₹) *
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={editDoctorModal.consultationFee ?? 750}
                    onChange={(e) => setEditDoctorModal({ ...editDoctorModal, consultationFee: parseFloat(e.target.value) || 0 })}
                  />
                </label>
              </div>

              <label>
                Hospital / Wing Affiliation
                <input
                  type="text"
                  value={editDoctorModal.hospitalAffiliation || ""}
                  onChange={(e) => setEditDoctorModal({ ...editDoctorModal, hospitalAffiliation: e.target.value })}
                  placeholder="e.g. Health & Cure Main Campus, Kolkata"
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  checked={editDoctorModal.isAvailable !== false}
                  onChange={(e) => setEditDoctorModal({ ...editDoctorModal, isAvailable: e.target.checked })}
                  style={{ width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-primary)" }}>
                  Available for Consultations &amp; New Appointments
                </span>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", paddingTop: "14px", borderTop: "1px solid var(--color-border-subtle)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditDoctorModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Doctor Confirmation Modal */}
      {deleteDoctorModal && (
        <div
          className="portal-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={() => setDeleteDoctorModal(null)}
        >
          <div
            className="portal-modal-box"
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              maxWidth: "520px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CloseIcon size={28} />
            </div>
            <h3 style={{ color: "#991B1B", textAlign: "center", margin: "0 0 10px", fontSize: "1.3rem" }}>
              Delete Doctor Record Permanently?
            </h3>
            <p style={{ textAlign: "center", color: "var(--color-text-body)", fontSize: "0.95rem", margin: "0 0 20px", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>Dr. {(deleteDoctorModal.first_name || deleteDoctorModal.firstName || "").replace(/^Dr\.?\s*/i, "")} {deleteDoctorModal.last_name || deleteDoctorModal.lastName}</strong> (DOC-{deleteDoctorModal.id})?
              <br />
              <span style={{ fontSize: "0.85rem", color: "#B91C1C", display: "block", marginTop: "8px" }}>
                ⚠️ Warning: This will permanently remove their credentials and unassign any related consultation slots.
              </span>
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteDoctorModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ background: "#DC2626", color: "#FFFFFF", border: "none", padding: "10px 22px" }}
                onClick={handleDeleteDoctor}
              >
                Yes, Delete Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editPatientModal && (
        <div
          className="portal-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={() => setEditPatientModal(null)}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--color-border-subtle)", background: "#F8FAF9" }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--color-primary)", fontSize: "1.25rem" }}>
                  Maintain Patient Record
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Editing PAT-{editPatientModal.id} • {editPatientModal.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditPatientModal(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}
              >
                <CloseIcon size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdatePatient} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  First Name *
                  <input
                    type="text"
                    required
                    value={editPatientModal.firstName || ""}
                    onChange={(e) => setEditPatientModal({ ...editPatientModal, firstName: e.target.value })}
                  />
                </label>
                <label>
                  Last Name *
                  <input
                    type="text"
                    required
                    value={editPatientModal.lastName || ""}
                    onChange={(e) => setEditPatientModal({ ...editPatientModal, lastName: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label>
                  Phone Number
                  <input
                    type="text"
                    value={editPatientModal.phone || ""}
                    onChange={(e) => setEditPatientModal({ ...editPatientModal, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </label>
                <label>
                  Emergency Contact Phone
                  <input
                    type="text"
                    value={editPatientModal.emergencyContact || ""}
                    onChange={(e) => setEditPatientModal({ ...editPatientModal, emergencyContact: e.target.value })}
                    placeholder="+91 9051579029"
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <label>
                  Gender
                  <select
                    value={editPatientModal.gender || "Other"}
                    onChange={(e) => setEditPatientModal({ ...editPatientModal, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label>
                  Blood Group
                  <select
                    value={editPatientModal.bloodGroup || "O+"}
                    onChange={(e) => setEditPatientModal({ ...editPatientModal, bloodGroup: e.target.value })}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </label>
                <label>
                  Date of Birth
                  <input
                    type="date"
                    value={editPatientModal.dateOfBirth || ""}
                    onChange={(e) => setEditPatientModal({ ...editPatientModal, dateOfBirth: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Residential Address
                <input
                  type="text"
                  value={editPatientModal.address || ""}
                  onChange={(e) => setEditPatientModal({ ...editPatientModal, address: e.target.value })}
                  placeholder="Full street address, city, pin code..."
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", paddingTop: "14px", borderTop: "1px solid var(--color-border-subtle)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditPatientModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Patient Confirmation Modal */}
      {deletePatientModal && (
        <div
          className="portal-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={() => setDeletePatientModal(null)}
        >
          <div
            className="portal-modal-box"
            style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              maxWidth: "520px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CloseIcon size={28} />
            </div>
            <h3 style={{ color: "#991B1B", textAlign: "center", margin: "0 0 10px", fontSize: "1.3rem" }}>
              Delete Patient Record Permanently?
            </h3>
            <p style={{ textAlign: "center", color: "var(--color-text-body)", fontSize: "0.95rem", margin: "0 0 20px", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete patient <strong>{deletePatientModal.first_name || deletePatientModal.firstName} {deletePatientModal.last_name || deletePatientModal.lastName}</strong> (PAT-{deletePatientModal.id})?
              <br />
              <span style={{ fontSize: "0.85rem", color: "#B91C1C", display: "block", marginTop: "8px" }}>
                ⚠️ Warning: This will permanently delete their account, user credentials, access requests, appointments, and associated encrypted medical records.
              </span>
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletePatientModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ background: "#DC2626", color: "#FFFFFF", border: "none", padding: "10px 22px" }}
                onClick={handleDeletePatient}
              >
                Yes, Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
