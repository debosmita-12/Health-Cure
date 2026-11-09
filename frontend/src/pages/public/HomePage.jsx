import { useState } from "react";
import { Link } from "react-router-dom";
import clinicPhoto from "../../assets/clinic-reception.jpg";
import heroPhoto from "../../assets/hero-consult.jpg";
import Brand from "../../components/common/Brand";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  LockIcon,
  PlayIcon,
  QuoteIcon,
} from "../../components/icons/icons";
import {
  principles,
  services,
  statistics,
  trustBadges,
} from "../../data/content";

export default function HomePage() {
  // Testimonial carousel state
  const [principleIndex, setPrincipleIndex] = useState(0);
  const currentTestimonial = principles[principleIndex];

  // Appointment Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    date: "",
    service: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Video modal state
  const [videoOpen, setVideoOpen] = useState(false);

  function handleCarouselStep(direction) {
    setPrincipleIndex((prev) => (prev + direction + principles.length) % principles.length);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert("Please provide at least your full name and contact number.");
      return;
    }
    setBookingSuccess(true);
  }

  return (
    <div className="home-page">
      {/* ========================================================
          1. HERO SECTION (Exact replication of reference image)
          ======================================================== */}
      <section className="hero-section" aria-label="Hero Overview">
        <div className="container hero-container">
          {/* Left Column: Hero Copy */}
          <div className="hero-copy">
            <p className="eyebrow-text">CARING TODAY FOR BRIGHTER TOMORROWS</p>

            <h1 className="hero-headline">
              <span className="headline-line1">Healthy</span>
              <span className="headline-line2-wrapper">
                <span className="headline-line2">Smiles</span>
                {/* Hand-drawn curved smile arc */}
                <svg
                  className="smile-arc-svg"
                  viewBox="0 0 100 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 8C28 20 72 20 94 8"
                    stroke="#5E8F7C"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Whimsical handwritten badge beside Smiles */}
                <span className="hero-script-badge" aria-hidden="true">
                  <span className="script-line">A</span>
                  <span className="script-line">Brighter</span>
                  <span className="script-line">You</span>
                  <span className="script-heart">♡</span>
                </span>
              </span>
              <span className="headline-line3">Happier Lives</span>
            </h1>

            <p className="hero-description">
              Gentle, modern healthcare &amp; connected records for you and your family.
            </p>

            <div className="hero-cta-group">
              <Link to="/book-appointment" className="btn btn-primary btn-hero">
                Book Appointment <ArrowRightIcon size={16} />
              </Link>

              <button
                type="button"
                className="btn btn-video"
                onClick={() => setVideoOpen(true)}
              >
                <span className="video-play-icon" aria-hidden="true">
                  <PlayIcon size={12} />
                </span>
                Watch Video
              </button>
            </div>

            {/* Trust Badges Row */}
            <div className="trust-badges-row">
              {trustBadges.map((badge) => (
                <div key={badge.title} className="trust-badge-item">
                  <span className="trust-badge-icon">
                    <badge.Icon size={20} />
                  </span>
                  <div className="trust-badge-text">
                    <strong>{badge.title}</strong>
                    <span>{badge.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Integrated Healthcare Image & Appointment Tile */}
          <div className="hero-integrated-tile" aria-label="Healthcare consultation and appointment booking">
            {/* Left Portion: Healthcare Image */}
            <div className="hero-tile-image-col">
              <img
                src={heroPhoto}
                alt="Smiling happy patient during a modern clinic consultation"
                className="hero-tile-img"
              />

              {/* Whimsical handwritten note on image */}
              <div className="image-script-note" aria-hidden="true">
                <span>A</span>
                <span>Brighter</span>
                <span>You</span>
                <span className="heart">♡</span>
              </div>
            </div>

            {/* Right Portion: Book Your Appointment Form */}
            <aside className="hero-tile-form-col" aria-label="Quick appointment form">
              <div className="booking-card-header">
                <span className="booking-card-badge">
                  <CalendarIcon size={20} />
                </span>
                <div>
                  <h2 className="booking-card-title">Book Your Appointment</h2>
                  <p className="booking-card-subtitle">
                    Take the first step towards a healthier, brighter smile.
                  </p>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="booking-success-message">
                  <span className="success-icon-wrap">
                    <CheckIcon size={24} />
                  </span>
                  <h3>Appointment Requested!</h3>
                  <p>
                    Thank you, <strong>{formData.fullName}</strong>. Our clinical coordinators will
                    contact you at <strong>{formData.phone}</strong> shortly to confirm.
                  </p>
                  <Link to="/book-appointment" className="btn btn-primary btn-sm">
                    View Appointment Details
                  </Link>
                </div>
              ) : (
                <form className="booking-card-form" onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      required
                      aria-label="Full Name"
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                      aria-label="Phone Number"
                    />
                  </div>

                  <div className="form-group date-input-wrap">
                    <input
                      type="date"
                      name="date"
                      placeholder="Select Date"
                      value={formData.date}
                      onChange={handleFormChange}
                      aria-label="Select Date"
                    />
                  </div>

                  <div className="form-group">
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleFormChange}
                      aria-label="Select Service"
                    >
                      <option value="">Select Service</option>
                      <option value="General Healthcare">General Healthcare &amp; Exams</option>
                      <option value="Specialist Care">Specialist Care &amp; Consult</option>
                      <option value="Prescription Care">Prescription Management</option>
                      <option value="Diagnostic Records">Diagnostic &amp; Lab Records</option>
                      <option value="Pediatric Care">Pediatric &amp; Family Care</option>
                      <option value="Emergency Care">Emergency Care</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block btn-booking-submit">
                    Book Now <ArrowRightIcon size={14} />
                  </button>

                  <p className="booking-secure-note">
                    <LockIcon size={14} />
                    <span>Your information is secure.</span>
                  </p>
                </form>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. OUR SERVICES SECTION (6-card grid matching reference)
          ======================================================== */}
      <section className="services-section" id="services">
        <div className="container">
          <div className="services-header-row">
            <div>
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle">Comprehensive care for every smile.</p>
            </div>
            <Link to="/services" className="btn btn-outline-pill">
              View All Services <ArrowRightIcon size={14} />
            </Link>
          </div>

          <div className="services-grid-6">
            {services.map((item) => (
              <article key={item.id} className="service-card-item">
                <div className="service-card-icon-wrap">
                  <item.Icon size={32} />
                </div>
                <h3 className="service-card-title">{item.title}</h3>
                <p className="service-card-desc">{item.text}</p>
                <Link
                  to={`/book-appointment?service=${encodeURIComponent(item.title)}`}
                  className="service-card-quick-link"
                >
                  Book Consult <ArrowRightIcon size={12} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          3. FEATURE & TESTIMONIAL SECTION (3-column layout)
          ======================================================== */}
      <section className="feature-section" id="about">
        <div className="container">
          <div className="feature-card-wrapper">
            {/* Column 1: Feature Copy */}
            <div className="feature-col-copy">
              <p className="eyebrow-text">A CALMER DENTAL &amp; HEALTH EXPERIENCE</p>
              <h2 className="feature-heading">
                Modern Care.
                <br />
                A Kinder Approach.
              </h2>
              <p className="feature-desc">
                We combine advanced technology with a warm, friendly approach to make every
                visit comfortable and stress-free.
              </p>
              <Link to="/about" className="btn btn-primary feature-btn">
                Learn More <ArrowRightIcon size={14} />
              </Link>
            </div>

            {/* Column 2: Modern Reception Photo */}
            <div className="feature-col-photo">
              <img
                src={clinicPhoto}
                alt="Bright modern clinic reception with curved desk, wood wall, and indoor plant"
                className="feature-reception-img"
              />
              <div className="feature-clinic-brand-badge">
                <Brand compact />
              </div>
            </div>

            {/* Column 3: Testimonial & Principle Carousel */}
            <div className="feature-col-testimonial">
              <div className="testimonial-quote-icon">
                <QuoteIcon size={34} />
              </div>

              <blockquote className="testimonial-quote-body">
                <p>"{currentTestimonial.quote}"</p>
                <footer className="testimonial-author">
                  <strong>— {currentTestimonial.byline}</strong>
                  {currentTestimonial.role && <span>{currentTestimonial.role}</span>}
                </footer>
              </blockquote>

              <div className="testimonial-carousel-controls">
                <button
                  type="button"
                  className="carousel-btn prev-btn"
                  onClick={() => handleCarouselStep(-1)}
                  aria-label="Previous testimonial"
                >
                  <ChevronIcon size={16} direction="left" />
                </button>

                <div className="carousel-dots-list" role="tablist" aria-label="Testimonials">
                  {principles.map((item, idx) => (
                    <button
                      key={item.byline}
                      type="button"
                      role="tab"
                      aria-selected={idx === principleIndex}
                      className={idx === principleIndex ? "carousel-dot active" : "carousel-dot"}
                      onClick={() => setPrincipleIndex(idx)}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="carousel-btn next-btn"
                  onClick={() => handleCarouselStep(1)}
                  aria-label="Next testimonial"
                >
                  <ChevronIcon size={16} direction="right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. STATISTICS SECTION (4-item white bar with dividers)
          ======================================================== */}
      <section className="stats-section" aria-label="Clinic Statistics">
        <div className="container">
          <div className="stats-bar-card">
            {statistics.map((stat, idx) => (
              <div key={stat.label} className="stats-item">
                <span className="stats-icon">
                  <stat.Icon size={34} />
                </span>
                <div className="stats-content">
                  <strong className="stats-value">{stat.value}</strong>
                  <span className="stats-label">{stat.label}</span>
                </div>
                {idx < statistics.length - 1 && <span className="stats-divider" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoOpen && (
        <div
          className="video-modal-backdrop"
          role="presentation"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="video-modal-content"
            role="dialog"
            aria-modal="true"
            aria-label="Clinic Overview Video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="video-close-btn"
              onClick={() => setVideoOpen(false)}
              aria-label="Close video"
            >
              <CloseIcon size={24} />
            </button>
            <div className="video-player-container">
              <div className="video-placeholder-card">
                <PlayIcon size={48} />
                <h3>Health &amp; Cure Patient Journey</h3>
                <p>A 2-minute tour of our patient-controlled medical records and connected care platform.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
