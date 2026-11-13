import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRightIcon,
  DoctorIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons/icons";

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const savedEmail = localStorage.getItem("hc-remember-email") || "";
  const [values, setValues] = useState({ email: savedEmail, password: "" });
  const [rememberMe, setRememberMe] = useState(Boolean(savedEmail));
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
        if (rememberMe) {
          localStorage.setItem("hc-remember-email", values.email.trim());
        } else {
          localStorage.removeItem("hc-remember-email");
        }
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
    <section className="subpage login-page" style={{ background: "radial-gradient(circle at 10% 20%, rgba(167, 243, 208, 0.35) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(209, 250, 229, 0.4) 0%, transparent 45%), #F4FAF7" }}>
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

          <div className="portal-access-tips" style={{ background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(23, 76, 64, 0.12)", borderRadius: "16px", padding: "20px", boxShadow: "0 8px 24px rgba(23,76,64,0.06)" }}>
            <h4 style={{ margin: "0 0 4px", color: "var(--color-primary)", fontSize: "1.05rem" }}>Demo Accounts for Instant Evaluation:</h4>
            <p style={{ margin: "0 0 12px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>Click any account below to auto-fill credentials:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ textAlign: "left", justifyContent: "flex-start", padding: "10px 14px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(23, 76, 64, 0.15)", background: "rgba(255, 255, 255, 0.9)" }}
                onClick={() => fillDemoAccount("debosmita@healthcure.local", "123456789")}
                title="Click to fill Patient credentials"
              >
                <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#E8F5E9", color: "#174C40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <UsersIcon size={16} />
                </span>
                <div>
                  <strong style={{ color: "var(--color-primary)", display: "block", fontSize: "0.88rem" }}>Patient: Debosmita Mukhopadhyay</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>debosmita@healthcure.local • <code>123456789</code></span>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ textAlign: "left", justifyContent: "flex-start", padding: "10px 14px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(23, 76, 64, 0.15)", background: "rgba(255, 255, 255, 0.9)" }}
                onClick={() => fillDemoAccount("debasis@healthcure.local", "De@120603")}
                title="Click to fill Doctor credentials"
              >
                <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#E8F5E9", color: "#174C40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <DoctorIcon size={16} />
                </span>
                <div>
                  <strong style={{ color: "var(--color-primary)", display: "block", fontSize: "0.88rem" }}>Doctor: Dr. Debasis Mukhopadhyay</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>debasis@healthcure.local • <code>De@120603</code></span>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ textAlign: "left", justifyContent: "flex-start", padding: "10px 14px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(23, 76, 64, 0.15)", background: "rgba(255, 255, 255, 0.9)" }}
                onClick={() => fillDemoAccount("rakhi@healthcure.local", "Ra@170879")}
                title="Click to fill Admin credentials"
              >
                <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#E8F5E9", color: "#174C40", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ShieldIcon size={16} />
                </span>
                <div>
                  <strong style={{ color: "var(--color-primary)", display: "block", fontSize: "0.88rem" }}>Admin: Rakhi Chatterjee</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>rakhi@healthcure.local • <code>Ra@170879</code></span>
                </div>
              </button>
            </div>
            <ul>
              <li>Sessions automatically lock after periods of inactivity.</li>
              <li>Every document access is recorded in an immutable audit log.</li>
              <li>Patient consent is checked on every clinical API request.</li>
            </ul>
          </div>

          <p className="quiet-links">
            Don't have an account yet? <Link to="/register">Create an account here</Link>
          </p>
        </div>

        <div className="form-card-container">
          {loginSuccess ? (
            <div className="form-success-card" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.7)", boxShadow: "0 12px 36px rgba(23, 76, 64, 0.09)" }}>
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
            <div className="panel-form-card" style={{ background: "rgba(255, 255, 255, 0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.7)", boxShadow: "0 14px 40px rgba(23, 76, 64, 0.08)" }}>
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
                  
                  {/* Forgot Password aligned right under password */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                    <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
                      Forgot Password?
                    </Link>
                  </div>
                </label>

                {/* Remember Me on the left of Sign In Button, Sign In button shortened */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginTop: "12px" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "var(--color-text-body)", cursor: "pointer", margin: 0, fontWeight: 500, whiteSpace: "nowrap" }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: "var(--color-primary)", width: "17px", height: "17px", cursor: "pointer" }}
                    />
                    Remember Me
                  </label>

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isLoading}
                    style={{ flex: 1, padding: "12px 18px", fontSize: "0.95rem", justifyContent: "center" }}
                  >
                    {isLoading ? "Authenticating..." : "Sign In to Portal"}{" "}
                    <ArrowRightIcon size={14} />
                  </button>
                </div>

                <div style={{ textAlign: "center", margin: "18px 0 6px", fontSize: "0.88rem", color: "var(--color-text-body)" }}>
                  Need an account?{" "}
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
