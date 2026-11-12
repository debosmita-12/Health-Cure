import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { ArrowRightIcon, CheckIcon, LockIcon } from "../../components/icons/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid account email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email: email.trim() });
      setSuccessMessage(res.data?.message || "Password reset instructions have been generated.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to process password reset request. Please check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="subpage login-page">
      <div className="container form-layout">
        <div className="subpage-intro">
          <p className="eyebrow-text">ACCOUNT RECOVERY</p>
          <h1 className="subpage-title">
            Reset Your
            <br />
            <span>Password.</span>
          </h1>
          <p className="subpage-desc">
            Enter the email address associated with your Health &amp; Cure account. We will verify your account and provide secure password recovery instructions.
          </p>

          <div className="portal-access-tips" style={{ marginTop: "24px" }}>
            <h4>Security Note:</h4>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-body)", marginTop: "8px" }}>
              To protect patient confidentiality and clinical records, password reset requests are monitored and logged to our immutable security audit trail.
            </p>
          </div>
        </div>

        <div className="form-card-container">
          {successMessage ? (
            <div className="form-success-card">
              <span className="success-icon-wrap"><CheckIcon size={28} /></span>
              <h3>Recovery Requested</h3>
              <p>{successMessage}</p>
              <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to="/reset-password" className="btn btn-primary btn-sm">
                  Proceed to Reset Password <ArrowRightIcon size={14} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="panel-form" onSubmit={handleSubmit} noValidate>
              <div className="panel-form-header">
                <h3>Forgot Password</h3>
                <p>Provide your registered email address to begin recovery.</p>
              </div>

              {error && (
                <div className="form-error-alert" style={{ marginBottom: "16px" }}>
                  <p>{error}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="recovery-email">Email Address *</label>
                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-booking-submit"
                disabled={isLoading}
              >
                {isLoading ? "Generating Instructions..." : "Send Reset Instructions"}{" "}
                <ArrowRightIcon size={14} />
              </button>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Link to="/login" style={{ color: "var(--color-primary)", fontSize: "0.9rem", textDecoration: "none", fontWeight: 600 }}>
                  Remembered your password? Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
