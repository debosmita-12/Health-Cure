import { useState } from "react";
import { Link } from "react-router-dom";
import clinicPhoto from "../../assets/clinic-reception.jpg";
import heroPhoto from "../../assets/hero-consult.jpg";
import Brand from "../../components/common/Brand";
import api from "../../services/api";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  CodeIcon,
  LockIcon,
  PlayIcon,
  QuoteIcon,
  ShieldIcon,
} from "../../components/icons/icons";
import {
  principles,
  services,
  statistics,
  trustBadges,
} from "../../data/content";

const DEVELOPERS = [
  { id: "dev-1", name: "Debosmita Mukhopadhyay", initials: "DM" },
  { id: "dev-2", name: "Muthu Amuthan", initials: "MA" },
  { id: "dev-3", name: "Amanjeeta Rath", initials: "AR" },
  { id: "dev-4", name: "Khushi Kumari", initials: "KK" },
];

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
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  // Video modal state
  const [videoOpen, setVideoOpen] = useState(false);

  // Contact section form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [contactErrors, setContactErrors] = useState({});
  const [contactSuccess, setContactSuccess] = useState(false);

  function handleCarouselStep(direction) {
    setPrincipleIndex((prev) => (prev + direction + principles.length) % principles.length);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validateBookingForm() {
    const errors = {};
    const cleanName = formData.fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      errors.fullName = "Please enter your full name (at least 2 characters).";
    }

    const digitsOnly = formData.phone.replace(/[^0-9]/g, "");
    if (!digitsOnly || digitsOnly.length < 7) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }

    if (!formData.date) {
      errors.date = "Please select a preferred appointment date.";
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (formData.date < today) {
        errors.date = "Appointment date cannot be in the past.";
      }
    }

    if (!formData.service) {
      errors.service = "Please select a healthcare service.";
    }

    return errors;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validateBookingForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        appointmentDate: `${formData.date}T09:00:00`,
        specialty: formData.service,
        consultationType: "In-Clinic Visit",
        timeSlot: "Morning (09:00 - 12:00)",
      };

      const res = await api.post("/api/appointments/book", payload);
      setBookingResult(res.data);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to register appointment at this time. Please check your connection or contact the clinic."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleContactChange(e) {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
    if (contactErrors[name]) {
      setContactErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!contactForm.name.trim() || contactForm.name.trim().length < 2) {
      errors.name = "Please enter your name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!contactForm.message.trim() || contactForm.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }

    setContactErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const existing = JSON.parse(localStorage.getItem("hc-messages") || "[]");
    existing.push({
      ...contactForm,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem("hc-messages", JSON.stringify(existing));
    setContactSuccess(true);
    setContactForm({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
  }

  return (
    <div className="home-page">
      {/* ========================================================
          1. HERO SECTION (Exact replication of reference image)
          ======================================================== */}
      <section className="hero-section" id="hero" aria-label="Hero Overview">
        <div className="container hero-container">
          {/* Left Column: Hero Copy */}
          <div className="hero-copy">
            {/* 1. Tagline: Static text with NO blinking cursor or caret */}
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
            {/* Left Portion: Healthcare Image (Clean photo without text overlay) */}
            <div className="hero-tile-image-col">
              <img
                src={heroPhoto}
                alt="Smiling happy patient during a modern clinic consultation"
                className="hero-tile-img"
              />
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

              {bookingResult ? (
                <div className="booking-success-message">
                  <span className="success-icon-wrap">
                    <CheckIcon size={24} />
                  </span>
                  <h3>Appointment Confirmed!</h3>
                  <div style={{ margin: "10px 0", padding: "6px 12px", background: "#DEF7EC", borderRadius: "6px", display: "inline-block", color: "#03543F", fontWeight: 700, fontSize: "0.88rem" }}>
                    Reference: {bookingResult.referenceCode}
                  </div>
                  <p>
                    Thank you, <strong>{bookingResult.patientName || formData.fullName}</strong>. Your consultation has been registered for <strong>{formData.service}</strong>.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: "12px" }}
                    onClick={() => {
                      setBookingResult(null);
                      setFormData({ fullName: "", phone: "", date: "", service: "" });
                    }}
                  >
                    Book Another Visit
                  </button>
                </div>
              ) : (
                <form className="booking-card-form" onSubmit={handleFormSubmit} noValidate>
                  {submitError && (
                    <div className="form-error-alert" style={{ fontSize: "0.85rem", padding: "8px 12px", marginBottom: "12px" }}>
                      {submitError}
                    </div>
                  )}

                  <div className="form-group">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      aria-label="Full Name"
                    />
                    {formErrors.fullName && (
                      <small style={{ color: "#E02424", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                        {formErrors.fullName}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleFormChange}
                      aria-label="Phone Number"
                    />
                    {formErrors.phone && (
                      <small style={{ color: "#E02424", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                        {formErrors.phone}
                      </small>
                    )}
                  </div>

                  <div className="form-group date-input-wrap">
                    <input
                      type="date"
                      name="date"
                      placeholder="Select Date *"
                      value={formData.date}
                      onChange={handleFormChange}
                      aria-label="Select Date"
                    />
                    {formErrors.date && (
                      <small style={{ color: "#E02424", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                        {formErrors.date}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleFormChange}
                      aria-label="Select Service"
                    >
                      <option value="">Select Service *</option>
                      <option value="General Healthcare">General Healthcare &amp; Exams</option>
                      <option value="Specialist Care">Specialist Care &amp; Consult</option>
                      <option value="Prescription Care">Prescription Management</option>
                      <option value="Diagnostic Records">Diagnostic &amp; Lab Records</option>
                      <option value="Pediatric Care">Pediatric &amp; Family Care</option>
                      <option value="Emergency Care">Emergency Care</option>
                    </select>
                    {formErrors.service && (
                      <small style={{ color: "#E02424", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                        {formErrors.service}
                      </small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-booking-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Booking Appointment..." : "Book Now"}{" "}
                    <ArrowRightIcon size={14} />
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

      {/* ========================================================
          5. CONTACT SECTION
          ======================================================== */}
      <section className="home-contact-section" id="contact" aria-label="Contact Section">
        <div className="container form-layout">
          <div className="subpage-intro">
            <p className="eyebrow-text">GET IN TOUCH</p>
            <h2 className="section-title" style={{ fontSize: "2.5rem", marginBottom: "16px" }}>
              Connect with
              <br />
              <span style={{ color: "var(--color-sage)" }}>Health &amp; Cure.</span>
            </h2>
            <p className="subpage-desc">
              Have questions regarding clinical appointments, patient record privacy, or physician credential
              onboarding? Our care coordinators and technical support team are here to assist.
            </p>

            <div className="contact-details-card" style={{ marginTop: "28px" }}>
              <div className="contact-info-item">
                <span className="contact-icon"><ShieldIcon size={20} /></span>
                <div>
                  <strong>Clinical Coordination Desk</strong>
                  <p>care@healthcure.local | Mon–Sat: 08:00 – 20:00</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-icon"><LockIcon size={20} /></span>
                <div>
                  <strong>Data Protection &amp; Privacy Officer</strong>
                  <p>privacy@healthcure.local | Response within 24h</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card-container">
            {contactSuccess ? (
              <div className="form-success-card">
                <span className="success-icon-wrap"><CheckIcon size={28} /></span>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. Our clinical coordinators will respond within 2 hours.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: "16px" }}
                  onClick={() => setContactSuccess(false)}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form className="panel-form" onSubmit={handleContactSubmit} noValidate>
                <div className="panel-form-header">
                  <h3>Send Us a Message</h3>
                  <p>We typically respond to patient and clinical inquiries within 2 hours.</p>
                </div>

                <div className="form-row-2">
                  <label>
                    Full Name *
                    <input
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder="e.g. Eleanor Hayes"
                      required
                    />
                    {contactErrors.name && <small style={{ color: "#E02424" }}>{contactErrors.name}</small>}
                  </label>

                  <label>
                    Email Address *
                    <input
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="name@example.com"
                      required
                    />
                    {contactErrors.email && <small style={{ color: "#E02424" }}>{contactErrors.email}</small>}
                  </label>
                </div>

                <label>
                  Message *
                  <textarea
                    name="message"
                    rows="3"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Describe your inquiry..."
                    required
                  />
                  {contactErrors.message && <small style={{ color: "#E02424" }}>{contactErrors.message}</small>}
                </label>

                <button type="submit" className="btn btn-primary btn-block">
                  Send Message <ArrowRightIcon size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. MEET OUR DEVELOPERS SECTION (Immediately after Contact)
          ======================================================== */}
      <section className="developers-section" id="developers" aria-label="Meet Our Developers">
        <div className="container">
          <div className="developers-header">
            <p className="eyebrow-text">ENGINEERING &amp; INNOVATION</p>
            <h2 className="section-title">Meet Our Developers</h2>
            <p className="section-subtitle">
              The team behind Health &amp; Cure – Building technology for better healthcare.
            </p>
          </div>

          <div className="developers-grid">
            {DEVELOPERS.map((dev) => (
              <div key={dev.id} className="developer-card">
                <div className="developer-avatar-wrap" aria-hidden="true">
                  <CodeIcon size={30} />
                </div>
                <h3 className="developer-name">{dev.name}</h3>
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
