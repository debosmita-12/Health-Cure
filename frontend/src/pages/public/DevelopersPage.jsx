import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../../components/icons/icons";

const DEVELOPERS = [
  {
    id: "dev-1",
    name: "Debosmita Mukhopadhyay",
    role: "Full-Stack Software Architect & Lead Engineer",
    bio: "Architecture design, distributed systems, and end-to-end full-stack engineering.",
  },
  {
    id: "dev-2",
    name: "Muthu Amuthan",
    role: "Backend Architect & Database Engineer",
    bio: "Spring Boot core services, Spring JDBC data persistence, and security protocols.",
  },
  {
    id: "dev-3",
    name: "Amanjeeta Rath",
    role: "UI/UX & Frontend Platform Specialist",
    bio: "Design systems, responsive interfaces, and accessible patient-centric workflows.",
  },
  {
    id: "dev-4",
    name: "Khushi Kumari",
    role: "Quality Assurance & Application Security Analyst",
    bio: "Security auditing, zero-trust consent validation, and automated platform testing.",
  },
];

// Professional Human Person SVG Icon
function PersonAvatarIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function DevelopersPage() {
  return (
    <div className="subpage developers-page">
      <div className="container">
        <div className="subpage-header" style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 40px" }}>
          <p className="eyebrow-text">ENGINEERING &amp; INNOVATION</p>
          <h1 className="subpage-main-title">
            Meet Our Developers.
            <br />
            <span>The Team Behind Health &amp; Cure.</span>
          </h1>
          <p className="subpage-lede">
            Built with modern software engineering principles, rigorous application security, and dedicated patient-centric design.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            marginBottom: "50px",
          }}
        >
          {DEVELOPERS.map((dev) => (
            <div
              key={dev.id}
              style={{
                background: "var(--color-white)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "16px",
                padding: "28px 24px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#EEF8F3",
                  color: "#174C40",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                  border: "2px solid #D1FAE5",
                }}
              >
                <PersonAvatarIcon />
              </div>
              <h3 style={{ fontSize: "1.15rem", color: "var(--color-primary)", fontWeight: 700, margin: "0 0 6px 0" }}>
                {dev.name}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-sage)", fontWeight: 600, margin: "0 0 12px 0" }}>
                {dev.role}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.5, margin: 0 }}>
                {dev.bio}
              </p>
            </div>
          ))}
        </div>

        <div className="subpage-bottom-banner">
          <div className="banner-content">
            <h3>Interested in Contributing or Learning More?</h3>
            <p>Explore the platform architecture or get in touch with our clinical engineering team.</p>
          </div>
          <div className="banner-actions">
            <Link to="/contact" className="btn btn-primary">
              Contact Team <ArrowRightIcon size={14} />
            </Link>
            <Link to="/about" className="btn btn-secondary">
              Platform Architecture
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
