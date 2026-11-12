import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GoogleAuthButton from "../../components/common/GoogleAuthButton";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "../../components/icons/icons";

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginRole, setLoginRole] = useState("");

  const noticeMessage = location.state?.notice;

  function update(event) {
    setErrors({});
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function fillDemoAccount(email, password) {
    setValues({ email, password });
    setErrors({});
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
      const res = await login(values.email, values.password);
      if (res.success) {
        setLoginRole(res.user.role);
        setLoginSuccess(true);
        navigate(getDashboardPath(res.user.role));
      } else {
        setErrors({ general: res.error });
      }
    } catch {
      setErrors({ general: "Authentication service unavailable. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  function getDashboardPath(role) {
    switch (role) {
      case "PATIENT":
        return "/patient/dashboard";
      case "DOCTOR":
        return "/doctor/dashboard";
      case "SUPERADMIN":
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/";
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
            <h4>Demo Accounts for Instant Evaluation:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", marginBottom: "16px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ textAlign: "left", justifyContent: "flex-start", padding: "8px 12px" }}
                onClick={() => fillDemoAccount("patient@healthcure.local", "Patient@123")}
              >
                👤 <strong>Patient:</strong> patient@healthcure.local
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ textAlign: "left", justifyContent: "flex-start", padding: "8px 12px" }}
                onClick={() => fillDemoAccount("doctor@healthcure.local", "Doctor@123")}
              >
                🩺 <strong>Doctor:</strong> doctor@healthcure.local
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ textAlign: "left", justifyContent: "flex-start", padding: "8px 12px" }}
                onClick={() => fillDemoAccount("admin@healthcure.local", "Admin@123")}
              >
                🛡️ <strong>Admin:</strong> admin@healthcure.local
              </button>
            </div>
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
                <Link to={getDashboardPath(loginRole)} className="btn btn-primary btn-block">
                  Go to {loginRole.charAt(0) + loginRole.slice(1).toLowerCase()} Dashboard <ArrowRightIcon size={14} />
                </Link>
                <Link to="/" className="btn btn-secondary btn-block">
                  Go to Platform Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="panel-form-card">
              {noticeMessage && (
                <div style={{ padding: "12px 16px", background: "#FEF3C7", borderRadius: "10px", border: "1px solid #FCD34D", color: "#92400E", marginBottom: "16px", fontSize: "0.88rem", lineHeight: 1.5 }}>
                  ℹ️ {noticeMessage}
                </div>
              )}

              {errors.general && <p className="form-error-alert">{errors.general}</p>}

              <form className="panel-form" onSubmit={submit} noValidate>
                <div className="panel-form-header">
                  <h2>Portal Sign-In</h2>
                  <p>Use your registered patient, verified doctor, or admin credentials.</p>
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
                  <div style={{ textAlign: "right", marginTop: "6px" }}>
                    <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
                      Forgot Password?
                    </Link>
                  </div>
                </label>

                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : "Sign In to Portal"}{" "}
                  <ArrowRightIcon size={14} />
                </button>

                {/* Continue with Google button below the standard email/password form */}
                <GoogleAuthButton mode="login" />

                <div style={{ textAlign: "center", margin: "14px 0 6px", fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                  Need a patient account?{" "}
                  <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                    Register here
                  </Link>
                </div>

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
