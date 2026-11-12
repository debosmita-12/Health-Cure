import { Link } from "react-router-dom";
import {
  LogoMark,
  SocialFacebookIcon,
  SocialInstagramIcon,
  SocialLinkedinIcon,
} from "../icons/icons";

export default function Footer() {
  const socialLinks = [
    {
      name: "Instagram",
      label: "@debo_1266",
      icon: SocialInstagramIcon,
      url: "https://www.instagram.com/debo_1266",
    },
    {
      name: "LinkedIn",
      label: "Debosmita Mukhopadhyay",
      icon: SocialLinkedinIcon,
      url: "https://www.linkedin.com/in/debosmita-mukhopadhyay-3b508a324",
    },
    {
      name: "Facebook",
      label: "Health & Cure",
      icon: SocialFacebookIcon,
      url: "https://www.facebook.com",
    },
  ];

  return (
    <footer
      className="site-footer"
      style={{
        backgroundColor: "#F9FAF9",
        borderTop: "1px solid var(--color-border-subtle, #E5E7EB)",
        padding: "48px 0 24px",
        color: "var(--color-text-body, #374151)",
      }}
    >
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Main Footer Grid: 4 Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "36px",
            paddingBottom: "36px",
            borderBottom: "1px solid var(--color-border-subtle, #E5E7EB)",
          }}
        >
          {/* Column 1: Logo & Brand + Tagline + Short Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <LogoMark size={32} />
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--color-primary, #174C40)",
                  letterSpacing: "-0.02em",
                }}
              >
                Health &amp; Cure
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-primary, #174C40)",
              }}
            >
              Your Health, Our Priority.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "var(--color-text-muted, #6B7280)",
              }}
            >
              An integrated healthcare management platform connecting patients, verified doctors, and clinical care with secure digital records.
            </p>
          </div>

          {/* Column 2: Legal & Platform Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-primary, #174C40)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 4px",
              }}
            >
              Legal &amp; Policy
            </h4>
            <Link
              to="/security#privacy"
              style={{
                color: "var(--color-text-body, #374151)",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary, #174C40)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-body, #374151)")}
            >
              Privacy Policy
            </Link>
            <Link
              to="/security#terms"
              style={{
                color: "var(--color-text-body, #374151)",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary, #174C40)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-body, #374151)")}
            >
              Terms &amp; Conditions
            </Link>
            <Link
              to="/security#disclaimer"
              style={{
                color: "var(--color-text-body, #374151)",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary, #174C40)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-body, #374151)")}
            >
              Disclaimer
            </Link>
            <Link
              to="/about"
              style={{
                color: "var(--color-text-body, #374151)",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary, #174C40)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-body, #374151)")}
            >
              About Platform
            </Link>
            <Link
              to="/developers"
              style={{
                color: "var(--color-text-body, #374151)",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary, #174C40)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-body, #374151)")}
            >
              Developers Team
            </Link>
          </div>

          {/* Column 3: Contact Information */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-primary, #174C40)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 4px",
              }}
            >
              Contact Information
            </h4>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #174C40)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <div>
                <span style={{ display: "block", color: "var(--color-text-muted, #6B7280)", fontSize: "0.8rem" }}>Official Email</span>
                <a href="mailto:care@healthcure.local" style={{ color: "var(--color-primary, #174C40)", fontWeight: 600, textDecoration: "none" }}>
                  care@healthcure.local
                </a>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #174C40)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div>
                <span style={{ display: "block", color: "var(--color-text-muted, #6B7280)", fontSize: "0.8rem" }}>Helpline &amp; Support</span>
                <a href="tel:+919051579029" style={{ color: "var(--color-primary, #174C40)", fontWeight: 600, textDecoration: "none" }}>
                  +91 9051579029
                </a>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #174C40)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <span style={{ display: "block", color: "var(--color-text-muted, #6B7280)", fontSize: "0.8rem" }}>Official Address</span>
                <span style={{ color: "var(--color-text-body, #374151)" }}>Health &amp; Cure Super Speciality Hospital, Sector V, Salt Lake, Kolkata, West Bengal - 700091, India</span>
              </div>
            </div>
          </div>

          {/* Column 4: Social Media */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h4
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-primary, #174C40)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 4px",
              }}
            >
              Social Media
            </h4>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-muted, #6B7280)" }}>
              Follow our official channels for clinical updates, wellness articles, and announcements:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {socialLinks.map(({ name, label, icon: Icon, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "var(--color-text-body, #374151)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary, #174C40)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-body, #374151)")}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#EEF8F3",
                      color: "var(--color-primary, #174C40)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #D1FAE5",
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted, #6B7280)" }}>({label})</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar: Copyright & Legal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            paddingTop: "24px",
            fontSize: "0.85rem",
            color: "var(--color-text-muted, #6B7280)",
          }}
        >
          <p style={{ margin: 0 }}>
            &copy; 2026 Health &amp; Cure. All Rights Reserved.
          </p>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <Link
              to="/security#privacy"
              style={{ color: "var(--color-text-muted, #6B7280)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary, #174C40)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #6B7280)")}
            >
              Privacy Policy
            </Link>
            <span aria-hidden="true">&bull;</span>
            <Link
              to="/security#terms"
              style={{ color: "var(--color-text-muted, #6B7280)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary, #174C40)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #6B7280)")}
            >
              Terms &amp; Conditions
            </Link>
            <span aria-hidden="true">&bull;</span>
            <Link
              to="/security#disclaimer"
              style={{ color: "var(--color-text-muted, #6B7280)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary, #174C40)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #6B7280)")}
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
