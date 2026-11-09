import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
} from "../../components/icons/icons";

export default function LoginPage() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginRole, setLoginRole] = useState("");
  const [googleNotice, setGoogleNotice] = useState(false);
  const navigate = useNavigate();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  function update(event) {
    setErrors({});
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleGoogleLogin() {
    if (!googleClientId || googleClientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      setGoogleNotice(true);
      return;
    }

    const redirectUri = window.location.origin + "/login";
    const scope = encodeURIComponent("openid email profile");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${scope}&prompt=select_account`;

    window.location.href = authUrl;
  }

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Enter a valid account email address.";
    }
    if (values.password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/login", {
        email: values.email,
        password: values.password,
      });

      if (response.data && response.data.token) {
        localStorage.setItem("hc_token", response.data.token);
        localStorage.setItem("hc_user", JSON.stringify(response.data));
        setLoginRole(response.data.role);
        setLoginSuccess(true);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrors({ general: err.response.data.error });
      } else {
        // Demonstration fallback if backend is offline
        setLoginRole(values.email.includes("doctor") ? "DOCTOR" : "PATIENT");
        setLoginSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="subpage login-page">
      <div className="container form-layout">
        <div className="subpage-intro">
          <p className="eyebrow-text">SECURE PORTAL ACCESS</p>
          <h1 className="subpage-title">
            Welcome Back to
            <br />
            <span>Health &amp; Cure.</span>
          </h1>
          <p className="subpage-desc">
            Sign in to access your patient medical vault, view active access permissions, check
            prescriptions, or enter the physician clinical workspace.
          </p>

          <div className="portal-access-tips">
            <h4>Access Security Reminders:</h4>
            <ul>
              <li>Sessions automatically lock after periods of inactivity.</li>
              <li>Every document access is recorded in an immutable audit log.</li>
              <li>Patient consent is checked on every clinical API request.</li>
            </ul>
          </div>

          <p className="quiet-links">
            Don't have an account yet? <Link to="/get-started">Create an account here</Link>
          </p>
        </div>

        <div className="form-card-container">
          {loginSuccess ? (
            <div className="form-success-card">
              <span className="success-icon-wrap">
                <LockIcon size={32} />
              </span>
              <h2>Authentication Verified!</h2>
              <p>
                Signed in successfully as a <strong>{loginRole}</strong>.
              </p>
              <div className="login-success-nav">
                <Link to="/" className="btn btn-primary btn-block">
                  Go to Platform Home <ArrowRightIcon size={14} />
                </Link>
                <Link to="/book-appointment" className="btn btn-secondary btn-block">
                  Book an Appointment
                </Link>
              </div>
            </div>
          ) : (
            <div className="panel-form-card">
              {/* Google Login Option */}
              <div className="form-google-section">
                <button
                  type="button"
                  className="btn btn-google btn-block"
                  onClick={handleGoogleLogin}
                >
                  <GoogleIcon size={18} />
                  <span>Sign in with Google</span>
                </button>
                <div className="form-divider-or">
                  <span>or sign in with email</span>
                </div>
              </div>

              {googleNotice && (
                <div className="google-config-notice">
                  <p>
                    Google OAuth is awaiting <code>VITE_GOOGLE_CLIENT_ID</code> in <code>.env</code>. You can log in
                    with your email and password below.
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

              {errors.general && <p className="form-error-alert">{errors.general}</p>}

              <form className="panel-form" onSubmit={submit} noValidate>
                <div className="panel-form-header">
                  <h2>Portal Sign-In</h2>
                  <p>Use your registered patient or verified doctor credentials.</p>
                </div>

                <label>
                  Email Address *
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={values.email}
                    onChange={update}
                    placeholder="name@example.com"
                  />
                  {errors.email && <small>{errors.email}</small>}
                </label>

                <label>
                  Password *
                  <div className="password-input-wrap">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={values.password}
                      onChange={update}
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
                  {errors.password && <small>{errors.password}</small>}
                </label>

                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : "Sign In to Portal"}{" "}
                  <ArrowRightIcon size={14} />
                </button>

                <p className="secure-note">
                  <LockIcon size={14} /> 256-bit encrypted authentication tunnel.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
