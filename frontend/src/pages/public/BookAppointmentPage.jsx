import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  DoctorIcon,
  GoogleIcon,
  LockIcon,
  ShieldIcon,
  StethoscopeIcon,
  UsersIcon,
} from "../../components/icons/icons";

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service") || "General Healthcare";

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    date: "",
    timeSlot: "Morning (09:00 - 12:00)",
    consultationType: "In-Clinic Visit",
    specialty: initialService,
    preferredDoctor: "First Available Specialist",
    reason: "",
  });

  // Google Auth State
  const [googleUser, setGoogleUser] = useState(null);
  const [googleAuthError, setGoogleAuthError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showConfigNotice, setShowConfigNotice] = useState(false);

  // Booking submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Check URL params for returned Google OAuth token / state if redirect flow was used
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        fetchGoogleProfile(accessToken);
      }
    }
  }, []);

  async function fetchGoogleProfile(accessToken) {
    setIsGoogleLoading(true);
    setGoogleAuthError("");
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const profile = await res.json();
        setGoogleUser(profile);
        setFormData((prev) => ({
          ...prev,
          fullName: profile.name || prev.fullName,
          email: profile.email || prev.email,
        }));
        // Clean URL fragment
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        setGoogleAuthError("Failed to retrieve Google profile.");
      }
    } catch (err) {
      setGoogleAuthError("Network error while connecting to Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function handleGoogleSignIn() {
    if (!googleClientId || googleClientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      setShowConfigNotice(true);
      return;
    }

    setIsGoogleLoading(true);
    setGoogleAuthError("");

    // Standard Google OAuth 2.0 Authorization endpoint with prompt=select_account
    const redirectUri = window.location.origin + "/book-appointment";
    const scope = encodeURIComponent("openid email profile");
    const responseType = "token"; // implicit token flow for instant form fill
    const prompt = "select_account";

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=${responseType}&scope=${scope}&prompt=${prompt}`;

    window.location.href = authUrl;
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      return "Please enter a valid full name (at least 2 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }
    const digits = formData.phone.replace(/[^0-9]/g, "");
    if (!digits || digits.length < 7) {
      return "Please enter a valid phone number (at least 7 digits).";
    }
    if (!formData.date) {
      return "Please select a preferred appointment date.";
    }
    const today = new Date().toISOString().split("T")[0];
    if (formData.date < today) {
      return "Appointment date cannot be in the past.";
    }
    if (!formData.specialty) {
      return "Please select a medical specialty.";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErr = validateForm();
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Send to Spring Boot backend via Spring JDBC persistence
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        appointmentDate: `${formData.date}T10:00:00`,
        timeSlot: formData.timeSlot,
        consultationType: formData.consultationType,
        specialty: formData.specialty,
        preferredDoctor: formData.preferredDoctor,
        notes: formData.reason,
        googleAuthenticated: !!googleUser,
      };

      const response = await api.post("/api/appointments/book", payload);
      setBookingResult(response.data);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to schedule appointment with the clinic server. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="subpage booking-page">
      <div className="container">
        {/* Header */}
        <div className="subpage-header">
          <p className="eyebrow-text">SCHEDULE YOUR CLINICAL VISIT</p>
          <h1 className="subpage-main-title">
            Book an Appointment.
            <br />
            <span>Fast, Connected Healthcare.</span>
          </h1>
          <p className="subpage-lede">
            Sign in with Google to instantly populate your verified profile details, or complete the
            form manually. Every visit is conducted under patient-controlled privacy rules.
          </p>
        </div>

        {/* Booking Form Layout */}
        <div className="booking-layout-grid">
          {/* Left Column: Google Auth & Clinic Highlights */}
          <div className="booking-info-col">
            {/* Google Authentication Box */}
            <div className="google-auth-box">
              <div className="google-auth-head">
                <span className="google-badge-circle">
                  <GoogleIcon size={24} />
                </span>
                <div>
                  <h3>Google Sign-In</h3>
                  <p>Fast, verified appointment booking with account selection.</p>
                </div>
              </div>

              {googleUser ? (
                <div className="google-user-authenticated">
                  <div className="google-profile-chip">
                    {googleUser.picture && (
                      <img src={googleUser.picture} alt="" className="google-avatar" />
                    )}
                    <div>
                      <strong>{googleUser.name}</strong>
                      <span>{googleUser.email}</span>
                    </div>
                  </div>
                  <p className="google-autofill-note">
                    <CheckIcon size={16} /> Details auto-populated from Google
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setGoogleUser(null);
                      setFormData((prev) => ({ ...prev, fullName: "", email: "" }));
                    }}
                  >
                    Switch Account
                  </button>
                </div>
              ) : (
                <div className="google-signin-trigger">
                  <button
                    type="button"
                    className="btn btn-google btn-block"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    <GoogleIcon size={20} />
                    <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
                  </button>
                  <p className="google-privacy-hint">
                    Uses Google OAuth 2.0 with <code>prompt=select_account</code>. We only retrieve your verified
                    name and email address.
                  </p>
                </div>
              )}

              {/* Notice when Google Client ID is awaiting user credentials */}
              {showConfigNotice && (
                <div className="google-config-notice">
                  <h4>Google OAuth Configuration Guide</h4>
                  <p>
                    Google Sign-In is ready for your Google Cloud credentials. To activate direct redirect:
                  </p>
                  <ol>
                    <li>Create an OAuth 2.0 Client ID in the Google Cloud Console.</li>
                    <li>Add <code>http://localhost:5173</code> to Authorised JavaScript Origins.</li>
                    <li>Add <code>http://localhost:5173/book-appointment</code> to Authorised Redirect URIs.</li>
                    <li>Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code>.</li>
                  </ol>
                  <p>In the meantime, you can fill in the appointment form manually below.</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowConfigNotice(false)}
                  >
                    Dismiss Notice
                  </button>
                </div>
              )}

              {googleAuthError && <p className="form-error-alert">{googleAuthError}</p>}
            </div>

            {/* Clinic Advantages Box */}
            <div className="booking-advantages-box">
              <h4>Why Book with Health &amp; Cure?</h4>
              <ul>
                <li>
                  <span className="adv-icon"><StethoscopeIcon size={18} /></span>
                  <div>
                    <strong>Verified Specialists:</strong> Board-certified physicians across all medical disciplines.
                  </div>
                </li>
                <li>
                  <span className="adv-icon"><LockIcon size={18} /></span>
                  <div>
                    <strong>Zero-Trust Privacy:</strong> Doctors can only access records you explicitly approve.
                  </div>
                </li>
                <li>
                  <span className="adv-icon"><CalendarIcon size={18} /></span>
                  <div>
                    <strong>Flexible Rescheduling:</strong> Change or cancel visits up to 2 hours in advance.
                  </div>
                </li>
                <li>
                  <span className="adv-icon"><ShieldIcon size={18} /></span>
                  <div>
                    <strong>Connected History:</strong> Prescriptions and notes save directly to your patient portal.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Appointment Form */}
          <div className="booking-form-col">
            {bookingResult ? (
              <div className="booking-confirmed-card">
                <span className="confirmed-icon-circle">
                  <CheckIcon size={36} />
                </span>
                <h2>Appointment Confirmed!</h2>
                <div className="confirmed-reference-badge">
                  Reference Code: <strong>{bookingResult.referenceCode}</strong>
                </div>
                <p className="confirmed-desc">
                  Thank you, <strong>{formData.fullName}</strong>. Your appointment has been successfully
                  registered. A confirmation email and calendar invitation have been sent to{" "}
                  <strong>{formData.email}</strong>.
                </p>

                <div className="confirmed-summary-box">
                  <div className="summary-row">
                    <span>Specialty:</span>
                    <strong>{formData.specialty}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Consultation Type:</span>
                    <strong>{formData.consultationType}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Preferred Doctor:</span>
                    <strong>{formData.preferredDoctor}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Preferred Time:</span>
                    <strong>{formData.timeSlot}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Date:</span>
                    <strong>{formData.date || "Next Available"}</strong>
                  </div>
                </div>

                <div className="confirmed-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setBookingResult(null);
                      setFormData({
                        fullName: "",
                        email: "",
                        phone: "",
                        date: "",
                        timeSlot: "Morning (09:00 - 12:00)",
                        consultationType: "In-Clinic Visit",
                        specialty: "General Healthcare",
                        preferredDoctor: "First Available Specialist",
                        reason: "",
                      });
                    }}
                  >
                    Book Another Visit
                  </button>
                  <Link to="/" className="btn btn-secondary">
                    Return to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              <form className="booking-panel-form" onSubmit={handleSubmit}>
                <div className="form-head">
                  <h3>Appointment Details</h3>
                  <p>All fields marked with an asterisk are required.</p>
                </div>

                {errorMessage && <p className="form-error-alert">{errorMessage}</p>}

                {/* Patient Information */}
                <div className="form-row-2">
                  <label>
                    Full Name *
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Jessica Robinson"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </label>

                  <label>
                    Email Address *
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>

                <div className="form-row-2">
                  <label>
                    Phone Number *
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </label>

                  <label>
                    Preferred Date *
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>

                <div className="form-row-2">
                  <label>
                    Preferred Time Slot *
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleInputChange}
                    >
                      <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                      <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                      <option value="Evening (16:00 - 19:00)">Evening (16:00 - 19:00)</option>
                    </select>
                  </label>

                  <label>
                    Consultation Type *
                    <select
                      name="consultationType"
                      value={formData.consultationType}
                      onChange={handleInputChange}
                    >
                      <option value="In-Clinic Visit">In-Clinic Visit</option>
                      <option value="Video Consultation">Video Consultation</option>
                      <option value="Diagnostic Records Review">Diagnostic Records Review</option>
                    </select>
                  </label>
                </div>

                <div className="form-row-2">
                  <label>
                    Medical Specialty *
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                    >
                      <option value="General Healthcare">General Healthcare</option>
                      <option value="Specialist Care">Specialist Care (Cardiology, Ortho)</option>
                      <option value="Prescription Care">Prescription Management &amp; Refill</option>
                      <option value="Diagnostic Records">Diagnostic &amp; Pathology Records</option>
                      <option value="Pediatric & Family">Pediatric &amp; Family Care</option>
                      <option value="Emergency Care">Emergency Consultation</option>
                    </select>
                  </label>

                  <label>
                    Preferred Doctor
                    <select
                      name="preferredDoctor"
                      value={formData.preferredDoctor}
                      onChange={handleInputChange}
                    >
                      <option value="First Available Specialist">First Available Specialist</option>
                      <option value="Dr. Marcus Vance (Cardiology)">Dr. Marcus Vance (Cardiology)</option>
                      <option value="Dr. Sarah Jenkins (General Physician)">Dr. Sarah Jenkins (General Physician)</option>
                      <option value="Dr. Elena Rostova (Pediatrics)">Dr. Elena Rostova (Pediatrics)</option>
                      <option value="Dr. David Chen (Orthopedics)">Dr. David Chen (Orthopedics)</option>
                    </select>
                  </label>
                </div>

                <label>
                  Reason for Consultation / Symptoms
                  <textarea
                    name="reason"
                    rows="3"
                    placeholder="Briefly describe your symptoms, health concerns, or any questions for the physician..."
                    value={formData.reason}
                    onChange={handleInputChange}
                  />
                </label>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-book-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering Appointment..." : "Confirm & Book Appointment"}{" "}
                  <ArrowRightIcon size={14} />
                </button>

                <p className="secure-note">
                  <LockIcon size={14} /> Your consultation is protected by healthcare privacy encryption.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
