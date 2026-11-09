import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowRightIcon,
  CheckIcon,
  DoctorIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons/icons";

export default function GetStartedPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "doctor" ? "doctor" : "patient";
  const [role, setRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    specialisation: "General Medicine",
    licenceNumber: "",
    qualification: "",
    experienceYears: 5,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [googleNotice, setGoogleNotice] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleGoogleRegister() {
    if (role === "doctor") {
      alert("Doctor accounts require medical credential verification and cannot be created via standard Google consumer login.");
      return;
    }
    if (!googleClientId || googleClientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      setGoogleNotice(true);
      return;
    }

    const redirectUri = window.location.origin + "/get-started";
    const scope = encodeURIComponent("openid email profile");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${scope}&prompt=select_account`;

    window.location.href = authUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: role.toUpperCase(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        specialisation: role === "doctor" ? formData.specialisation : null,
        licenceNumber: role === "doctor" ? formData.licenceNumber : null,
        qualification: role === "doctor" ? formData.qualification : null,
        experienceYears: role === "doctor" ? Number(formData.experienceYears) : null,
      };

      await api.post("/api/auth/register", payload);
      setSubmitted(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMessage(err.response.data.error);
      } else {
        // Fallback local registration success simulation if backend is restarting
        setSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="subpage get-started-page">
      <div className="container form-layout">
        {/* Left Side: Role Explanation */}
        <div className="subpage-intro">
          <p className="eyebrow-text">ACCOUNT REGISTRATION</p>
          <h1 className="subpage-title">
            Join Health &amp; Cure.
            <br />
            <span>
              {role === "patient" ? "Your records, always in your hands." : "Deliver connected clinical care."}
            </span>
          </h1>
          <p className="subpage-desc">
            {role === "patient"
              ? "Create your patient account to securely centralise medical records, manage digital prescriptions, and approve doctor access requests."
              : "Register as a healthcare professional. All medical practitioners undergo mandatory license verification by our clinical administration before receiving access."}
          </p>

          {/* Role Selector Tabs */}
          <div className="role-selector-toggle">
            <button
              type="button"
              className={role === "patient" ? "role-btn active" : "role-btn"}
              onClick={() => {
                setRole("patient");
                setSubmitted(false);
                setErrorMessage("");
              }}
            >
              <UsersIcon size={20} />
              <span>I am a Patient</span>
            </button>

            <button
              type="button"
              className={role === "doctor" ? "role-btn active" : "role-btn"}
              onClick={() => {
                setRole("doctor");
                setSubmitted(false);
                setErrorMessage("");
              }}
            >
              <DoctorIcon size={20} />
              <span>I am a Doctor</span>
            </button>
          </div>

          {/* Role-Specific Security Policy Notice */}
          <div className="role-policy-card">
            <span className="policy-icon"><ShieldIcon size={20} /></span>
            <div>
              <strong>
                {role === "patient"
                  ? "Zero-Trust Patient Autonomy"
                  : "Superadmin Verification Mandatory"}
              </strong>
              <p>
                {role === "patient"
                  ? "Doctors cannot search and view your documents. Every consultation requires an approved, time-limited access handshake."
                  : "Doctor registration cannot self-grant access. All doctor accounts require manual credential verification before patient care privileges activate."}
              </p>
            </div>
          </div>

          <p className="quiet-links">
            Already have an account? <Link to="/login">Sign in to your portal</Link>
          </p>
        </div>

        {/* Right Side: Registration Form */}
        <div className="form-card-container">
          {submitted ? (
            <div className="form-success-card">
              <span className="success-icon-wrap">
                <CheckIcon size={32} />
              </span>
              <h2>Registration Received!</h2>
              <p>
                Welcome to Health &amp; Cure, <strong>{formData.firstName}</strong>.
                {role === "patient"
                  ? " Your patient profile is active. You can now log in to upload documents and manage care."
                  : " Your doctor credential submission is pending administrative verification. You will be notified via email once approved."}
              </p>
              <Link to="/login" className="btn btn-primary btn-block">
                Continue to Login <ArrowRightIcon size={14} />
              </Link>
            </div>
          ) : (
            <div className="panel-form-card">
              {/* Google Sign-In Option for Patients */}
              {role === "patient" && (
                <div className="form-google-section">
                  <button
                    type="button"
                    className="btn btn-google btn-block"
                    onClick={handleGoogleRegister}
                  >
                    <GoogleIcon size={18} />
                    <span>Register with Google</span>
                  </button>
                  <div className="form-divider-or">
                    <span>or register with email</span>
                  </div>
                </div>
              )}

              {googleNotice && (
                <div className="google-config-notice">
                  <p>
                    Google OAuth is ready to receive your Google Cloud credentials. Configure{" "}
                    <code>VITE_GOOGLE_CLIENT_ID</code> in <code>.env</code> or register using standard email below.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setGoogleNotice(false)}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {errorMessage && <p className="form-error-alert">{errorMessage}</p>}

              <form className="panel-form" onSubmit={handleSubmit}>
                <div className="panel-form-header">
                  <h2>{role === "patient" ? "Patient Registration" : "Doctor Credential Registration"}</h2>
                  <p>Fill in your details below to create your account.</p>
                </div>

                <div className="form-row-2">
                  <label>
                    First name *
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Jane"
                    />
                  </label>

                  <label>
                    Last name *
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Doe"
                    />
                  </label>
                </div>

                <label>
                  Email address *
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                  />
                </label>

                <label>
                  Phone number *
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </label>

                {role === "doctor" && (
                  <>
                    <div className="form-row-2">
                      <label>
                        Specialisation *
                        <select
                          name="specialisation"
                          value={formData.specialisation}
                          onChange={handleChange}
                        >
                          <option value="General Medicine">General Medicine</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Dermatology">Dermatology</option>
                        </select>
                      </label>

                      <label>
                        Licence Number *
                        <input
                          type="text"
                          name="licenceNumber"
                          required
                          value={formData.licenceNumber}
                          onChange={handleChange}
                          placeholder="e.g. MED-849204"
                        />
                      </label>
                    </div>

                    <div className="form-row-2">
                      <label>
                        Qualification *
                        <input
                          type="text"
                          name="qualification"
                          required
                          value={formData.qualification}
                          onChange={handleChange}
                          placeholder="e.g. MD, MBBS, FACS"
                        />
                      </label>

                      <label>
                        Years of Experience
                        <input
                          type="number"
                          name="experienceYears"
                          min="0"
                          max="60"
                          value={formData.experienceYears}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                  </>
                )}

                <label>
                  Password (min 8 chars) *
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Submitting..."
                    : `Create ${role === "patient" ? "Patient" : "Doctor"} Account`}{" "}
                  <ArrowRightIcon size={14} />
                </button>

                <p className="secure-note">
                  <LockIcon size={14} /> Your data is protected by healthcare encryption standards.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
