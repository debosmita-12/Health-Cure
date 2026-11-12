import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRightIcon,
  CalendarIcon,
  DoctorIcon,
  LockIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons/icons";

export default function BookAppointmentPage() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role === "PATIENT") {
      navigate("/patient/book-appointment", { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <section className="subpage">
      <div className="container" style={{ maxWidth: "760px", margin: "60px auto", padding: "0 20px" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid var(--color-border-subtle)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
            padding: "48px 36px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--color-mint-bg)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              border: "2px solid #D1FAE5",
            }}
          >
            <CalendarIcon size={34} />
          </div>

          <p className="eyebrow-text">PATIENT PORTAL APPOINTMENT BOOKING</p>
          <h1 style={{ fontSize: "2.1rem", color: "var(--color-primary)", fontWeight: 800, margin: "8px 0 16px" }}>
            Appointment Scheduling is Managed Inside the Patient Portal
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--color-text-body)", lineHeight: 1.65, maxWidth: "580px", margin: "0 auto 28px" }}>
            To safeguard clinical privacy, prevent booking conflicts, and link your consultations directly to your lifetime digital health record, appointment booking is exclusive to the authenticated Patient Portal.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              textAlign: "left",
              background: "var(--color-mint-bg)",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "32px",
              border: "1px solid rgba(23, 76, 64, 0.08)",
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <ShieldIcon size={20} />
              <div>
                <strong style={{ display: "block", color: "var(--color-primary)", fontSize: "0.92rem" }}>
                  Verified Medical History
                </strong>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Consultations attach automatically to your encrypted health file.
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <DoctorIcon size={20} />
              <div>
                <strong style={{ display: "block", color: "var(--color-primary)", fontSize: "0.92rem" }}>
                  Verified Specialist Slots
                </strong>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                  Real-time synchronization with physician clinical availability.
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/login" className="ref-btn-primary" style={{ padding: "12px 28px" }}>
              Sign In to Patient Portal →
            </Link>
            <Link to="/register" className="ref-btn-secondary" style={{ padding: "12px 26px" }}>
              Create Patient Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
