import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  ShieldAlertIcon,
  ShieldIcon,
} from "../../components/icons/icons";
import { securityRules } from "../../data/content";

export default function SecurityRulesPage() {
  return (
    <div className="subpage security-rules-page">
      <div className="container">
        {/* Header */}
        <div className="subpage-header">
          <p className="eyebrow-text">SECURITY, PRIVACY &amp; CONSENT GOVERNANCE</p>
          <h1 className="subpage-main-title">
            Health &amp; Cure Security Rules.
            <br />
            <span>Zero-Trust Architecture for Medical Records.</span>
          </h1>
          <p className="subpage-lede">
            Medical information is extraordinarily sensitive. Our architecture is engineered around the principle
            that patients have complete autonomy over their medical records. Every access attempt, upload, and
            download is verified cryptographically and logged immutably.
          </p>
        </div>

        {/* Highlight Banner: Doctor Search Limitation & Superadmin Restrictions */}
        <div className="security-critical-banner">
          <div className="critical-banner-badge">
            <ShieldAlertIcon size={32} />
          </div>
          <div className="critical-banner-text">
            <h3>Fundamental Architectural Boundaries</h3>
            <div className="critical-rules-list">
              <div className="critical-rule-item">
                <span className="check-bullet"><CheckIcon size={14} /></span>
                <p>
                  <strong>Search Never Unlocks Documents:</strong> A doctor searching for a patient on Health &amp; Cure
                  can only view the patient directory profile. Under no circumstance does searching grant access to
                  medical documents, prescriptions, or laboratory tests.
                </p>
              </div>
              <div className="critical-rule-item">
                <span className="check-bullet"><CheckIcon size={14} /></span>
                <p>
                  <strong>Patient Approval is Strictly Mandatory:</strong> Every document inspection requires an active,
                  patient-approved Access Request. No doctor can self-authorise clinical access.
                </p>
              </div>
              <div className="critical-rule-item">
                <span className="check-bullet"><CheckIcon size={14} /></span>
                <p>
                  <strong>Instant Revocation:</strong> Revoked permissions cut off all doctor access immediately at the
                  backend layer. Expired permissions cannot be reused.
                </p>
              </div>
              <div className="critical-rule-item">
                <span className="check-bullet"><CheckIcon size={14} /></span>
                <p>
                  <strong>Superadmin Access Prohibited:</strong> System administrators oversee user verification and
                  audit logs, but have zero architectural permission to view private patient health documents.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 12 Core Security Pillars Grid */}
        <div className="security-rules-grid">
          {securityRules.map((rule) => (
            <article key={rule.id} id={rule.id} className="security-rule-card">
              <div className="rule-card-header">
                <div className="rule-icon-box">
                  <rule.Icon size={24} />
                </div>
              </div>
              <h3 className="rule-card-title">{rule.title}</h3>
              <p className="rule-card-desc">{rule.text}</p>
            </article>
          ))}
        </div>

        {/* Technical Architecture Specs */}
        <div className="security-tech-specs">
          <div className="tech-specs-header">
            <LockIcon size={26} />
            <h3>Technical Implementation Details</h3>
          </div>
          <div className="specs-grid-3">
            <div className="spec-card">
              <h4>Cryptography &amp; Auth</h4>
              <p>JWT tokens signed using HMAC-SHA256 with 24-hour expiration windows. Password storage enforced via BCrypt with strength factor 12.</p>
            </div>
            <div className="spec-card">
              <h4>Database &amp; Persistence</h4>
              <p>PostgreSQL 18 database access powered strictly by Spring JDBC (JdbcTemplate). Explicit parameterised queries prevent SQL injection.</p>
            </div>
            <div className="spec-card">
              <h4>Access Auditing</h4>
              <p>Every single record request logs user ID, action, resource ID, IP address, and microsecond timestamp to an append-only audit table.</p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="subpage-bottom-banner">
          <div className="banner-content">
            <h3>Have Questions About Healthcare Security?</h3>
            <p>Our team is always available to discuss how Health &amp; Cure safeguards your medical history.</p>
          </div>
          <div className="banner-actions">
            <Link to="/contact" className="btn btn-secondary">
              Contact Privacy Team
            </Link>
            <Link to="/book-appointment" className="btn btn-primary">
              Book Appointment <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
