import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import GoogleAuthButton from "../../components/common/GoogleAuthButton";
import {
  ArrowRightIcon,
  CheckIcon,
  DoctorIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons/icons";

export default function GetStartedPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, role, login, setSession, logout } = useAuth();

  const [selectedRole, setSelectedRole] = useState("PATIENT");

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Patient fields
    dateOfBirth: "",
    gender: "Other",
    bloodGroup: "O+",
    address: "",
    emergencyContact: "",
    // Doctor fields
    specialisation: "General Medicine",
    licenceNumber: "",
    qualification: "MBBS, MD",
    experienceYears: "5",
    hospitalAffiliation: "Health & Cure Central Clinic",
    consultationFee: "75",
    biography: "",
    // Admin fields
    designation: "Platform Administrator",
    department: "Clinical Operations",
    adminKey: "",
    // Terms
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedRole, setSubmittedRole] = useState("PATIENT");
  const [doctorPendingNotice, setDoctorPendingNotice] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handleRoleChange(e) {
    setSelectedRole(e.target.value);
    setErrors({});
  }

  function validate() {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      newErrors.phone = "Valid contact number is required.";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Please agree to all the terms and conditions to proceed.";
    }

    if (selectedRole === "DOCTOR") {
      if (!formData.licenceNumber.trim()) {
        newErrors.licenceNumber = "Medical Registration / License number is required.";
      }
      if (!formData.specialisation.trim()) {
        newErrors.specialisation = "Specialization is required.";
      }
    }

    if (selectedRole === "ADMIN") {
      if (!formData.adminKey.trim()) {
        newErrors.adminKey = "Administrative Authorization Key is required.";
      }
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: selectedRole,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        // Patient specifics
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: formData.address.trim() || null,
        emergencyContact: formData.emergencyContact.trim() || null,
        // Doctor specifics
        specialisation: formData.specialisation,
        licenceNumber: formData.licenceNumber.trim() || null,
        qualification: formData.qualification.trim() || null,
        experienceYears: parseInt(formData.experienceYears, 10) || 5,
        hospitalAffiliation: formData.hospitalAffiliation.trim() || null,
        consultationFee: parseFloat(formData.consultationFee) || 75.0,
        biography: formData.biography.trim() || null,
        // Admin specifics
        designation: formData.designation.trim() || null,
        department: formData.department.trim() || null,
        adminKey: formData.adminKey.trim() || null,
      };

      const res = await api.post("/api/auth/register", payload);
      const authData = res.data;

      if (selectedRole === "PATIENT") {
        const enrichedAuth = {
          ...authData,
          bloodGroup: authData?.bloodGroup || formData.bloodGroup,
          gender: authData?.gender || formData.gender,
          phone: authData?.phone || formData.phone,
        };
        if (authData?.token) {
          setSession(enrichedAuth);
        } else {
          await login(formData.email.trim().toLowerCase(), formData.password);
        }
        navigate("/patient/dashboard");
        return;
      }

      if (selectedRole === "ADMIN") {
        if (authData?.token) {
          setSession(authData);
        } else {
          await login(formData.email.trim().toLowerCase(), formData.password);
        }
        navigate("/admin/dashboard");
        return;
      }

      // Doctor accounts require administrative credential verification
      setSubmittedRole("DOCTOR");
      setDoctorPendingNotice(authData?.message || "Your medical application is pending administrator verification.");
      setSubmitted(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration could not be completed. Please verify your details.";
      const isAlready =
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("already in use");
      setErrors({
        general: msg,
        alreadyRegistered: isAlready,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isAuthenticated) {
    const dashPath =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "DOCTOR"
        ? "/doctor/dashboard"
        : "/patient/dashboard";
    return (
      <section className="subpage get-started-page" style={{ padding: "80px 20px" }}>
        <div className="container" style={{ maxWidth: "620px", margin: "0 auto", textAlign: "center" }}>
          <div
            className="card"
            style={{
              padding: "44px 32px",
              borderRadius: "24px",
              border: "2px solid #10B981",
              background: "#FFFFFF",
              boxShadow: "0 10px 30px rgba(16, 185, 129, 0.08)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#ECFDF5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <UsersIcon size={34} />
            </div>
            <h2 style={{ color: "var(--color-primary)", fontSize: "1.8rem", marginBottom: "12px", fontWeight: 800 }}>
              Already Registered on Platform
            </h2>
            <p style={{ color: "var(--color-text-body)", fontSize: "1.02rem", lineHeight: 1.6, marginBottom: "26px" }}>
              You are currently signed in as <strong>{user?.firstName} {user?.lastName}</strong> ({user?.email}) with an active <strong>{role}</strong> session. Once registered, patients cannot register again and should access their existing portal directly.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to={dashPath} className="ref-btn-primary" style={{ padding: "12px 26px" }}>
                Go to My Dashboard →
              </Link>
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: "12px 22px", borderRadius: "9999px" }}
              >
                Sign Out to Use Another Account
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="subpage get-started-page">
      <div className="container form-layout">
        {/* Left Side: Healthcare Intro & Role Guidance */}
        <div className="subpage-intro">
          <p className="eyebrow-text">UNIFIED PLATFORM ONBOARDING</p>
          <h1 className="subpage-title">
            Join Health &amp; Cure.
            <br />
            <span>Connected care for everyone.</span>
          </h1>
          <p className="subpage-desc">
            A single, secure platform connecting Patients, Medical Practitioners, and Platform Administrators for comprehensive healthcare governance.
          </p>

          <div className="portal-access-tips" style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
              <div style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }}>
                <UsersIcon size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--color-primary)", fontSize: "0.95rem" }}>Patient Account</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-body)", marginTop: "4px", lineHeight: 1.4 }}>
                  Personal lifetime medical record vault, digital prescriptions, appointment scheduling, and consent controls.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
              <div style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }}>
                <DoctorIcon size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--color-primary)", fontSize: "0.95rem" }}>Doctor Account</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-body)", marginTop: "4px", lineHeight: 1.4 }}>
                  Clinical consultation management, electronic records, e-prescriptions, and appointment request handling. Requires administrator license verification.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }}>
                <ShieldIcon size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--color-primary)", fontSize: "0.95rem" }}>Admin Account</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-body)", marginTop: "4px", lineHeight: 1.4 }}>
                  Hospital operations, physician verification queue, departmental oversight, and forensic audit logging. Requires administrative key.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-body)" }}>
              Already registered on Health &amp; Cure?{" "}
              <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                Sign In to Portal →
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="form-card-container">
          {submitted ? (
            <div className="form-success-card">
              <span className="success-icon-wrap"><CheckIcon size={28} /></span>
              
              {submittedRole === "PATIENT" && (
                <>
                  <h3>Patient Account Created!</h3>
                  <p>Welcome to Health &amp; Cure, <strong>{formData.firstName}</strong>. Your personal medical record vault is active.</p>
                  <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                    <Link to="/patient/dashboard" className="btn btn-primary btn-sm">
                      Go to Patient Dashboard <ArrowRightIcon size={14} />
                    </Link>
                    <Link to="/patient/doctors" className="btn btn-secondary btn-sm">
                      Find a Doctor
                    </Link>
                  </div>
                </>
              )}

              {submittedRole === "DOCTOR" && (
                <>
                  <h3>Application Submitted for Verification!</h3>
                  <p>
                    Thank you, <strong>Dr. {formData.firstName} {formData.lastName}</strong>. Your medical credentials (License: <code>{formData.licenceNumber}</code>) have been submitted to the administration team.
                  </p>
                  <div style={{ margin: "14px 0", padding: "10px 14px", background: "#FEF3C7", borderRadius: "8px", border: "1px solid #FCD34D", color: "#92400E", fontSize: "0.88rem", lineHeight: 1.5 }}>
                    <strong>Status: Pending Verification</strong>
                    <br />
                    {doctorPendingNotice || "Once an authorized Administrator approves your registration in the Admin Console, you will have access to the Doctor Workspace."}
                  </div>
                  <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                    <Link to="/login" className="btn btn-primary btn-sm">
                      Return to Sign In <ArrowRightIcon size={14} />
                    </Link>
                  </div>
                </>
              )}

              {submittedRole === "ADMIN" && (
                <>
                  <h3>Admin Account Authorized!</h3>
                  <p>Welcome, <strong>{formData.firstName} {formData.lastName}</strong>. Administrative privileges have been granted for <strong>{formData.department}</strong>.</p>
                  <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                    <Link to="/admin/dashboard" className="btn btn-primary btn-sm">
                      Go to Admin Dashboard <ArrowRightIcon size={14} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form className="panel-form" onSubmit={handleSubmit} noValidate>
              <div className="panel-form-header">
                <h3>Account Registration</h3>
                <p>Select your user type to open the appropriate registration form.</p>
              </div>

              {errors.general && (
                <div style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: "12px", padding: "14px 18px", marginBottom: "18px" }}>
                  <p style={{ color: "#991B1B", fontWeight: 700, margin: "0 0 6px" }}>{errors.general}</p>
                  {errors.alreadyRegistered && (
                    <div style={{ marginTop: "10px" }}>
                      <p style={{ fontSize: "0.88rem", color: "#7F1D1D", margin: "0 0 10px" }}>
                        Once registered, a patient cannot register again and can directly sign in to their account.
                      </p>
                      <Link to="/login" className="ref-btn-primary" style={{ display: "inline-block", padding: "8px 18px", fontSize: "0.85rem" }}>
                        Sign In to Your Account →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Top: Select Account Type Dropdown (Prompt Mandatory Requirement) */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ fontWeight: 700, color: "var(--color-primary)", display: "block", marginBottom: "6px" }}>
                  Select Account Type
                </label>
                <select
                  name="role"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "2px solid var(--color-primary)",
                    background: "#F0FDF4",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--color-primary)",
                    cursor: "pointer",
                  }}
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Common Name Fields */}
              <div className="form-row-2">
                <label>
                  First Name *
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. John"
                    required
                  />
                  {errors.firstName && <small style={{ color: "#E02424" }}>{errors.firstName}</small>}
                </label>

                <label>
                  Last Name *
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Doe"
                    required
                  />
                  {errors.lastName && <small style={{ color: "#E02424" }}>{errors.lastName}</small>}
                </label>
              </div>

              {/* Common Contact Fields */}
              <div className="form-row-2">
                <label>
                  Email Address *
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                  />
                  {errors.email && <small style={{ color: "#E02424" }}>{errors.email}</small>}
                </label>

                <label>
                  Phone Number *
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9051579029"
                    required
                  />
                  {errors.phone && <small style={{ color: "#E02424" }}>{errors.phone}</small>}
                </label>
              </div>

              {/* Common Password Fields */}
              <div className="form-row-2">
                <label>
                  Password *
                  <div className="password-input-wrap">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {errors.password && <small style={{ color: "#E02424" }}>{errors.password}</small>}
                </label>

                <label>
                  Confirm Password *
                  <div className="password-input-wrap">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <small style={{ color: "#E02424" }}>{errors.confirmPassword}</small>
                  )}
                </label>
              </div>

              {/* ========================================================
                  ROLE A: PATIENT SPECIFIC FIELDS
                  ======================================================== */}
              {selectedRole === "PATIENT" && (
                <>
                  <div className="form-row-2">
                    <label>
                      Date of Birth
                      <input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </label>

                    <label>
                      Gender
                      <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-row-2">
                    <label>
                      Blood Group (Optional)
                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Emergency Contact (Optional)
                      <input
                        name="emergencyContact"
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="Emergency contact phone"
                      />
                    </label>
                  </div>

                  <label>
                    Address
                    <input
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. Salt Lake Sector V, Kolkata, West Bengal"
                    />
                  </label>
                </>
              )}

              {/* ========================================================
                  ROLE B: DOCTOR SPECIFIC FIELDS
                  ======================================================== */}
              {selectedRole === "DOCTOR" && (
                <>
                  <div className="form-row-2">
                    <label>
                      Medical Specialization *
                      <select name="specialisation" value={formData.specialisation} onChange={handleChange}>
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
                      </select>
                      {errors.specialisation && <small style={{ color: "#E02424" }}>{errors.specialisation}</small>}
                    </label>

                    <label>
                      Medical Registration / License # *
                      <input
                        name="licenceNumber"
                        type="text"
                        value={formData.licenceNumber}
                        onChange={handleChange}
                        placeholder="e.g. WB-MCI-2026-987"
                        required
                      />
                      {errors.licenceNumber && <small style={{ color: "#E02424" }}>{errors.licenceNumber}</small>}
                    </label>
                  </div>

                  <div className="form-row-2">
                    <label>
                      Qualifications
                      <input
                        name="qualification"
                        type="text"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g. MBBS, MD, DM (AIIMS New Delhi)"
                      />
                    </label>

                    <label>
                      Years of Experience
                      <input
                        name="experienceYears"
                        type="number"
                        min="1"
                        max="60"
                        value={formData.experienceYears}
                        onChange={handleChange}
                        placeholder="e.g. 8"
                      />
                    </label>
                  </div>

                  <div className="form-row-2">
                    <label>
                      Hospital / Clinic Affiliation
                      <input
                        name="hospitalAffiliation"
                        type="text"
                        value={formData.hospitalAffiliation}
                        onChange={handleChange}
                        placeholder="e.g. Health &amp; Cure Super Speciality Hospital, Kolkata"
                      />
                    </label>

                    <label>
                      Consultation Fee (₹ INR)
                      <input
                        name="consultationFee"
                        type="number"
                        min="0"
                        step="50"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        placeholder="750"
                      />
                    </label>
                  </div>

                  <label>
                    Professional Biography
                    <textarea
                      name="biography"
                      rows="2"
                      value={formData.biography}
                      onChange={handleChange}
                      placeholder="Brief clinical summary and medical experience..."
                    />
                  </label>

                  <div style={{ padding: "10px 14px", background: "#FEF3C7", borderRadius: "8px", border: "1px solid #FCD34D", color: "#92400E", fontSize: "0.85rem" }}>
                    ℹ️ <strong>Doctor Verification Required:</strong> New doctor registrations have a Pending status until verified by an Administrator in the Admin Console.
                  </div>
                </>
              )}

              {/* ========================================================
                  ROLE C: ADMIN SPECIFIC FIELDS
                  ======================================================== */}
              {selectedRole === "ADMIN" && (
                <>
                  <div className="form-row-2">
                    <label>
                      Designation
                      <input
                        name="designation"
                        type="text"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g. Platform Administrator"
                      />
                    </label>

                    <label>
                      Administrative Department
                      <input
                        name="department"
                        type="text"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. Clinical Operations"
                      />
                    </label>
                  </div>

                  <label>
                    Administrator Authorization Key *
                    <input
                      name="adminKey"
                      type="password"
                      value={formData.adminKey}
                      onChange={handleChange}
                      placeholder="Enter security key (e.g. HEALTHCURE-ADMIN-2026)"
                      required
                    />
                    {errors.adminKey && <small style={{ color: "#E02424" }}>{errors.adminKey}</small>}
                  </label>

                  <div style={{ padding: "10px 14px", background: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE", color: "#1E40AF", fontSize: "0.85rem" }}>
                    🔒 <strong>Security Policy:</strong> Administrative registration requires a cryptographic authorization key (Default demo key: <code>HEALTHCURE-ADMIN-2026</code>) to prevent unauthorized privilege escalation.
                  </div>
                </>
              )}

              {/* Terms Checkbox */}
              <label
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "16px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  style={{
                    width: "18px",
                    height: "18px",
                    minWidth: "18px",
                    minHeight: "18px",
                    margin: 0,
                    padding: 0,
                    accentColor: "var(--color-primary, #174C40)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.92rem",
                    color: "var(--color-text-body, #374151)",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  I agree to all the terms and conditions
                </span>
              </label>
              {errors.agreeTerms && (
                <small style={{ color: "#E02424", display: "block", marginBottom: "8px" }}>{errors.agreeTerms}</small>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ marginTop: "16px" }}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : `Register as ${selectedRole === "PATIENT" ? "Patient" : selectedRole === "DOCTOR" ? "Doctor" : "Admin"}`}{" "}
                <ArrowRightIcon size={14} />
              </button>

              {/* Continue with Google below registration form */}
              <GoogleAuthButton
                mode="register"
                role={selectedRole}
                formData={formData}
                onSuccess={(result) => {
                  setSubmittedRole(selectedRole);
                  if (result.pendingVerification) {
                    setDoctorPendingNotice(result.message);
                  }
                  setSubmitted(true);
                }}
                onError={(err) => setErrors({ general: err })}
              />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
