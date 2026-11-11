import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LockIcon } from "../icons/icons";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="subpage" style={{ textAlign: "center", padding: "100px 20px" }}>
        <p>Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles =
    role === "SUPERADMIN" ? ["SUPERADMIN", "ADMIN"] :
    role === "ADMIN" ? ["ADMIN", "SUPERADMIN"] :
    [role];

  if (allowedRoles && !allowedRoles.some(r => userRoles.includes(r))) {
    return (
      <section className="subpage">
        <div className="container" style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center" }}>
          <div className="panel-form-card" style={{ padding: "40px" }}>
            <span className="success-icon-wrap" style={{ background: "#FDE8E8", color: "#E02424", margin: "0 auto 20px" }}>
              <LockIcon size={32} />
            </span>
            <h2 style={{ marginBottom: "12px", color: "var(--color-primary)" }}>Access Restricted</h2>
            <p style={{ color: "var(--color-text-body)", marginBottom: "24px", lineHeight: "1.6" }}>
              Your current account role (<strong>{role}</strong>) does not have authorization to view this clinical portal.
            </p>
            <a href="/" className="btn btn-primary">
              Return to Platform Home
            </a>
          </div>
        </div>
      </section>
    );
  }

  return children;
}
