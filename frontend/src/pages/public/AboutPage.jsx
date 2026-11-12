import { Link } from "react-router-dom";
import clinicPhoto from "../../assets/clinic-reception.jpg";
import Brand from "../../components/common/Brand";
import {
  ArrowRightIcon,
  AuditIcon,
  CheckIcon,
  DoctorIcon,
  LockIcon,
  RecordsIcon,
  ShieldIcon,
  UsersIcon,
} from "../../components/icons/icons";
import { aboutPillars } from "../../data/content";

export default function AboutPage() {
  return (
    <div className="subpage about-page">
      <div className="container">
        {/* Hero Section */}
        <div className="about-hero-grid">
          <div className="about-hero-copy">
            <p className="eyebrow-text">ABOUT HEALTH &amp; CURE</p>
            <h1 className="subpage-main-title">
              Modern Healthcare.
              <br />
              <span>A More Connected Approach.</span>
            </h1>
            <p className="subpage-lede">
              Health &amp; Cure was engineered around a simple, fundamental truth: medical information belongs
              to the patient. We unite fragmented clinical consultations, diagnostic tests, and prescriptions
              into one lifetime medical record — accessible only when you explicitly approve.
            </p>
            <div className="about-hero-actions">
              <Link to="/book-appointment" className="btn btn-primary">
                Book an Appointment <ArrowRightIcon size={14} />
              </Link>
              <Link to="/security-rules" className="btn btn-secondary">
                Read Security Rules
              </Link>
            </div>
          </div>

          <div className="about-hero-visual">
            <div className="about-photo-wrapper">
              <img
                src={clinicPhoto}
                alt="Modern, state-of-the-art clinic reception and patient care facility"
                className="about-facility-img"
              />
              <div className="about-facility-badge">
                <Brand compact />
                <p>Advanced Clinical Care Facility</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="about-section-heading">
          <p className="eyebrow-text">SYSTEM PILLARS</p>
          <h2>Architected for Safety, Dignity &amp; Speed</h2>
          <p>The three foundational principles that guide every aspect of the Health &amp; Cure platform.</p>
        </div>

        <div className="pillars-grid">
          {aboutPillars.map((pillar, idx) => (
            <article key={pillar.title} className="pillar-card">
              <div className="pillar-card-header">
                <span className="pillar-icon-badge">
                  <pillar.Icon size={30} />
                </span>
                <span className="pillar-step-number">0{idx + 1}</span>
              </div>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-subtitle">{pillar.subtitle}</p>
              <p className="pillar-desc">{pillar.desc}</p>
            </article>
          ))}
        </div>

        {/* Deep Dive: Three Portals Role Separation */}
        <div className="three-portals-section">
          <div className="portals-box">
            <div className="portals-copy">
              <p className="eyebrow-text">ROLE-BASED AUTHORISATION</p>
              <h2>Three Portals. One Secure Platform.</h2>
              <p>
                Each role within Health &amp; Cure is architecturally partitioned to prevent data leakage and
                enforce least-privilege clinical security.
              </p>

              <div className="portals-list">
                <div className="portal-item">
                  <div className="portal-icon">
                    <UsersIcon size={22} />
                  </div>
                  <div>
                    <h4>Patient Portal</h4>
                    <p>
                      Full custody of your records, active access permissions, consultation history, and
                      prescriptions. Approve, expire, or revoke doctor access with a single click.
                    </p>
                  </div>
                </div>

                <div className="portal-item">
                  <div className="portal-icon">
                    <DoctorIcon size={22} />
                  </div>
                  <div>
                    <h4>Doctor Portal</h4>
                    <p>
                      Verified clinicians review medical histories of approved patients, author structured
                      prescriptions, record consultation diagnoses, and submit formal access requests.
                    </p>
                  </div>
                </div>

                <div className="portal-item">
                  <div className="portal-icon">
                    <ShieldIcon size={22} />
                  </div>
                  <div>
                    <h4>Admin Portal</h4>
                    <p>
                      Platform governance, physician license verification, and forensic audit logging.
                      Architecturally barred from viewing private patient medical documents by default.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="consent-callout-card">
              <span className="callout-badge">
                <LockIcon size={28} />
              </span>
              <h3>Zero-Trust Consent Model</h3>
              <p>
                A doctor searching for a patient cannot open or view their medical records without an
                approved, active, time-bounded permission handshake.
              </p>
              <ul className="consent-checklist">
                <li>
                  <CheckIcon size={16} /> <span>Searching a patient never unlocks files</span>
                </li>
                <li>
                  <CheckIcon size={16} /> <span>Doctors must submit a clinical reason</span>
                </li>
                <li>
                  <CheckIcon size={16} /> <span>Revocation immediately blocks all access</span>
                </li>
                <li>
                  <CheckIcon size={16} /> <span>Immutable cryptographic audit trail</span>
                </li>
              </ul>
              <Link to="/security-rules" className="btn btn-primary btn-block">
                View All 12 Security Rules <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="subpage-bottom-banner">
          <div className="banner-content">
            <h3>Take Control of Your Healthcare Today</h3>
            <p>Join thousands of patients enjoying connected, secure, and dignified medical care.</p>
          </div>
          <div className="banner-actions">
            <Link to="/get-started" className="btn btn-primary">
              Create an Account <ArrowRightIcon size={14} />
            </Link>
            <Link to="/book-appointment" className="btn btn-secondary">
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
