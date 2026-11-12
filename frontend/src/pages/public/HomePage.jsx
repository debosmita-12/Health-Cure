import { Link } from "react-router-dom";
import heroVisual from "../../assets/hero-mockup-visual.png";
import {
  HeartIcon,
  LightningIcon,
  ShieldIcon,
  SupportIcon,
  UsersIcon,
} from "../../components/icons/icons";

// Refined icons matching reference image
function CalendarStepIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <circle cx="16" cy="14" r="1" fill="currentColor" />
      <circle cx="8" cy="18" r="1" fill="currentColor" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function DoctorStepIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M17 11h5" />
      <path d="M19.5 8.5v5" />
    </svg>
  );
}

function ClipboardStepIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  );
}

function HeartPulseStepIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      <path d="M8.5 12.5h2l1 -2l2 4l1 -2h2" />
    </svg>
  );
}

function LeafCorner({ className }) {
  return (
    <svg className={className} width="80" height="80" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M20 80 Q 40 40 85 25 Q 70 65 30 75 Z" fill="#BCE3D2" stroke="#5E8F7C" strokeWidth="1.5" opacity="0.75" />
      <path d="M30 85 Q 10 55 35 30 Q 55 50 35 80 Z" fill="#D5EFE3" stroke="#5E8F7C" strokeWidth="1.5" opacity="0.8" />
      <path d="M15 90 C 35 65 60 45 85 25" stroke="#5E8F7C" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="home-page ref-home-exact">
      {/* Decorative ambient plus marks in background matching reference */}
      <span className="ref-floating-plus p1" aria-hidden="true">+</span>
      <span className="ref-floating-plus p2" aria-hidden="true">+</span>
      <span className="ref-floating-plus p3" aria-hidden="true">+</span>
      <span className="ref-floating-plus p4" aria-hidden="true">+</span>
      <span className="ref-floating-plus p5" aria-hidden="true">+</span>

      {/* ========================================================
          1. HERO SECTION (1:1 with Reference Image)
          ======================================================== */}
      <section className="ref-hero-section" id="hero" aria-label="Hero Overview">
        <div className="container">
          <div className="ref-hero-grid">
            {/* Left Column: Hero Copy */}
            <div className="hero-copy">
              <p className="eyebrow-text">CARING TODAY FOR BRIGHTER TOMORROWS</p>

              <h1 className="ref-hero-headline">
                Your Health
                <br />
                <span className="ref-priority-wrapper">
                  Our Priority.
                  <svg className="ref-priority-arc" viewBox="0 0 140 18" fill="none" aria-hidden="true">
                    <path d="M4 14C45 2 95 2 136 14" stroke="#5E8F7C" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="ref-hero-desc">
                Connect with trusted healthcare professionals, access quality care, and manage your health — all in one place.
              </p>

              <div className="ref-hero-buttons">
                <Link to="/book-appointment" className="ref-btn-primary">
                  Book Appointment &rarr;
                </Link>
                <Link to="/services" className="ref-btn-secondary">
                  <span className="ref-btn-play-circle">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                      <polygon points="2,1 9,5 2,9" />
                    </svg>
                  </span>
                  Explore Our Services
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual from Reference Image */}
            <div className="ref-hero-visual-container">
              <img
                src={heroVisual}
                alt="Health & Cure doctor consultation with patient and trusted care badges"
                className="ref-hero-img-exact"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. FEATURE STRIP (4-item bar from Reference Image)
          ======================================================== */}
      <div className="container">
        <div className="ref-feature-strip-bar">
          <div className="ref-strip-item">
            <div className="ref-strip-icon"><ShieldIcon size={20} /></div>
            <span>Verified Professionals</span>
          </div>

          <div className="ref-strip-item">
            <div className="ref-strip-icon"><HeartIcon size={20} /></div>
            <span>Secure &amp; Private</span>
          </div>

          <div className="ref-strip-item">
            <div className="ref-strip-icon"><LightningIcon size={20} /></div>
            <span>Digital Health Records</span>
          </div>

          <div className="ref-strip-item">
            <div className="ref-strip-icon"><SupportIcon size={20} /></div>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. WHY CHOOSE HEALTH & CURE (3 Cards from Reference Image)
          ======================================================== */}
      <section className="ref-why-section" id="why-choose" aria-label="Why Choose Health and Cure">
        <div className="container">
          <div className="ref-why-header">
            <p className="eyebrow">WHY CHOOSE HEALTH &amp; CURE</p>
            <div className="ref-section-title-flanked">
              <span className="flank-line" aria-hidden="true" />
              <h2>A Smarter Way to Healthcare</h2>
              <span className="flank-line" aria-hidden="true" />
            </div>
          </div>

          <div className="ref-why-grid">
            {/* Card 1 */}
            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <UsersIcon size={24} />
              </div>
              <div className="ref-why-body">
                <h3>For Everyone</h3>
                <p>Care for patients, tools for doctors, and powerful management for admins.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <ShieldIcon size={24} />
              </div>
              <div className="ref-why-body">
                <h3>Trusted &amp; Secure</h3>
                <p>Your data and health are always protected.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <LightningIcon size={24} />
              </div>
              <div className="ref-why-body">
                <h3>Accessible Anytime</h3>
                <p>Book, consult and manage from anywhere, anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. HOW IT WORKS (4 Horizontal Steps from Reference Image)
          ======================================================== */}
      <section className="ref-how-section" id="how-it-works" aria-label="How It Works">
        <div className="container">
          <div className="ref-how-header">
            <span className="ref-how-line" aria-hidden="true" />
            <h2>How It Works</h2>
            <span className="ref-how-line" aria-hidden="true" />
          </div>

          <div className="ref-how-row">
            <div className="ref-how-item">
              <div className="ref-how-icon-circle">
                <CalendarStepIcon />
              </div>
              <span className="ref-how-label">Book an<br />Appointment</span>
            </div>

            <span className="ref-how-arrow-mark" aria-hidden="true">&rarr;</span>

            <div className="ref-how-item">
              <div className="ref-how-icon-circle">
                <DoctorStepIcon />
              </div>
              <span className="ref-how-label">Consult with a<br />Professional</span>
            </div>

            <span className="ref-how-arrow-mark" aria-hidden="true">&rarr;</span>

            <div className="ref-how-item">
              <div className="ref-how-icon-circle">
                <ClipboardStepIcon />
              </div>
              <span className="ref-how-label">Access Your<br />Health Records</span>
            </div>

            <span className="ref-how-arrow-mark" aria-hidden="true">&rarr;</span>

            <div className="ref-how-item">
              <div className="ref-how-icon-circle">
                <HeartPulseStepIcon />
              </div>
              <span className="ref-how-label">Stay Healthier,<br />Happier</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. BOTTOM BANNER (From Reference Image)
          ======================================================== */}
      <div className="ref-cta-banner-wrap">
        <div className="ref-cta-banner">
          {/* Decorative leaves */}
          <LeafCorner className="ref-banner-leaf leaf-left" />

          <div className="ref-cta-left">
            <h2 className="ref-cta-heading">
              Your Health Journey
              <br />
              <span className="ref-journey-wrapper">
                Starts Here
                <svg className="banner-title-arc" viewBox="0 0 100 14" fill="none" aria-hidden="true">
                  <path d="M4 10C35 2 65 2 96 10" stroke="#5E8F7C" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
          </div>

          <div className="ref-cta-center">
            <p>
              Book an appointment today and take the first step towards a healthier tomorrow.
            </p>
          </div>

          <div className="ref-cta-right">
            <Link to="/book-appointment" className="ref-btn-primary ref-cta-btn-nowrap">
              Book Appointment &rarr;
            </Link>
            <div className="banner-heart-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#5E8F7C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          <LeafCorner className="ref-banner-leaf leaf-right" />
        </div>
      </div>
    </div>
  );
}
