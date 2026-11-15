import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Health & Cure ErrorBoundary caught an unhandled exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  handleLogin = () => {
    localStorage.removeItem("hc_token");
    localStorage.removeItem("hc_user");
    window.location.href = "/login";
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="subpage" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div className="container" style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
            <div className="panel-form-card" style={{ padding: "40px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", borderRadius: "20px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>
                ⚠️
              </div>
              <h2 style={{ marginBottom: "12px", color: "var(--color-primary, #174C40)" }}>
                Session Recovery
              </h2>
              <p style={{ color: "var(--color-text-body, #333)", marginBottom: "24px", lineHeight: "1.6" }}>
                A temporary rendering or authentication state issue was detected. Your account credentials and data remain safe.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.handleReload}
                >
                  Reload Page
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={this.handleLogin}
                >
                  Sign In Again
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={this.handleHome}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
