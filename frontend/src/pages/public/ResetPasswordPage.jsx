import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon } from "../../components/icons/icons";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid account email address.";
    }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters.";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/reset-password", {
        email: formData.email.trim(),
        token: formData.token.trim(),
        newPassword: formData.newPassword,
      });
      setSuccessMessage(res.data?.message || "Password successfully updated.");
    } catch (err) {
      setErrors({
        general:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update password. Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="subpage login-page">
      <div className="container form-layout">
        <div className="subpage-intro">
          <p className="eyebrow-text">SECURE CREDENTIALS</p>
          <h1 className="subpage-title">
            Set New
            <br />
            <span>Password.</span>
          </h1>
          <p className="subpage-desc">
            Choose a strong, unique password to secure your personal health records or clinical workspace.
          </p>

          <div className="portal-access-tips" style={{ marginTop: "24px" }}>
            <h4>Password Guidelines:</h4>
            <ul style={{ fontSize: "0.85rem", color: "var(--color-text-body)", paddingLeft: "18px", marginTop: "8px" }}>
              <li>At least 6 characters in length</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Include numbers or special symbols</li>
            </ul>
          </div>
        </div>

        <div className="form-card-container">
          {successMessage ? (
            <div className="form-success-card">
              <span className="success-icon-wrap"><CheckIcon size={28} /></span>
              <h3>Password Updated!</h3>
              <p>{successMessage}</p>
              <div style={{ marginTop: "20px" }}>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Sign In with New Password <ArrowRightIcon size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <form className="panel-form" onSubmit={handleSubmit} noValidate>
              <div className="panel-form-header">
                <h3>Reset Password</h3>
                <p>Enter your account details and new password below.</p>
              </div>

              {errors.general && (
                <div className="form-error-alert" style={{ marginBottom: "16px" }}>
                  <p>{errors.general}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="reset-email">Email Address *</label>
                <input
                  id="reset-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
                {errors.email && <small style={{ color: "#E02424" }}>{errors.email}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="reset-new-password">New Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button
                    type="button"
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-body)" }}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {errors.newPassword && <small style={{ color: "#E02424" }}>{errors.newPassword}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="reset-confirm-password">Confirm New Password *</label>
                <div className="password-input-wrap">
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat new password"
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
                {errors.confirmPassword && <small style={{ color: "#E02424" }}>{errors.confirmPassword}</small>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-booking-submit"
                disabled={isLoading}
              >
                {isLoading ? "Updating Password..." : "Update Password"}{" "}
                <ArrowRightIcon size={14} />
              </button>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Link to="/login" style={{ color: "var(--color-primary)", fontSize: "0.9rem", textDecoration: "none", fontWeight: 600 }}>
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
