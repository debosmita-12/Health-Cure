import { Link } from "react-router-dom";
import { ArrowRightIcon, CheckIcon, ShieldIcon } from "../../components/icons/icons";
import { workflowSteps } from "../../data/content";

export default function HowItWorksPage() {
  return (
    <div className="subpage how-it-works-page">
      <div className="container">
        {/* Subpage Header */}
        <div className="subpage-header">
          <p className="eyebrow-text">HOW HEALTH &amp; CURE WORKS</p>
          <h1 className="subpage-main-title">
            Your Health. Your Records.
            <br />
            <span>One Connected, Consent-First Journey.</span>
          </h1>
          <p className="subpage-lede">
            Every step in Health &amp; Cure is architected to give you absolute control over who accesses your
            medical history, while empowering attending physicians with the clinical context they need to
            provide exceptional care.
          </p>
        </div>

        {/* 6-Step Visual Timeline */}
        <div className="steps-timeline-container">
          <div className="steps-grid-2col">
            {workflowSteps.map((step) => (
              <div key={step.number} className="step-card">
                <div className="step-card-header">
                  <div className="step-number-badge">{step.number}</div>
                  <div className="step-icon-wrap">
                    <step.Icon size={24} />
                  </div>
                  <span className="step-badge-tag">{step.badge}</span>
                </div>

                <h3 className="step-card-title">{step.title}</h3>
                <p className="step-summary">{step.summary}</p>
                <p className="step-detail">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Reassurance Callout */}
        <div className="how-it-works-security-box">
          <div className="security-box-icon">
            <ShieldIcon size={36} />
          </div>
          <div className="security-box-copy">
            <h3>Strict Patient-Governed Privacy</h3>
            <p>
              No doctor or platform administrator can bypass this workflow. Searching for a patient merely
              returns public directory metadata; medical documents remain encrypted and strictly inaccessible
              without your explicit, active consent token.
            </p>
          </div>
          <div className="security-box-action">
            <Link to="/security-rules" className="btn btn-primary">
              Read the Security Rules <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="subpage-bottom-banner">
          <div className="banner-content">
            <h3>Ready to Experience Safe Healthcare?</h3>
            <p>Create your free patient account today or book a consultation with our verified doctors.</p>
          </div>
          <div className="banner-actions">
            <Link to="/get-started" className="btn btn-primary">
              Get Started <ArrowRightIcon size={14} />
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
