import { Link } from "react-router-dom";
import { ArrowRightIcon, CheckIcon } from "../../components/icons/icons";
import { services } from "../../data/content";

export default function ServicesPage() {
  return (
    <div className="subpage services-page">
      <div className="container">
        {/* Intro Header */}
        <div className="subpage-header">
          <p className="eyebrow-text">OUR MEDICAL SPECIALTIES &amp; SERVICES</p>
          <h1 className="subpage-main-title">
            Comprehensive Care for Every Patient.
            <br />
            <span>Connected in One Record.</span>
          </h1>
          <p className="subpage-lede">
            Six dedicated parts of your clinical care journey. Each service contributes directly to your
            unified, permanent medical history. Doctors see your details only after you explicitly grant
            access.
          </p>
        </div>

        {/* 3-Column Responsive Services Grid */}
        <div className="services-grid-3col">
          {services.map((service) => (
            <article key={service.id} id={service.id} className="service-card-full">
              <div className="service-card-top">
                <div className="service-icon-badge">
                  <service.Icon size={32} />
                </div>
                <span className="service-badge-pill">{service.badge}</span>
              </div>

              <h2 className="service-full-title">{service.title}</h2>
              <p className="service-short-desc">{service.text}</p>
              <p className="service-long-desc">{service.longDesc}</p>

              <div className="service-features-list">
                <h4>Key Clinical Features:</h4>
                <ul>
                  {service.features.map((feature) => (
                    <li key={feature}>
                      <span className="feature-check-icon">
                        <CheckIcon size={14} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="service-card-action">
                <Link
                  to={`/book-appointment?service=${encodeURIComponent(service.title)}`}
                  className="btn btn-secondary btn-block"
                >
                  Book Consultation <ArrowRightIcon size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Banner CTA */}
        <div className="subpage-bottom-banner">
          <div className="banner-content">
            <h3>Ready to Experience Connected Healthcare?</h3>
            <p>
              Book an appointment with one of our verified physicians or explore how our patient-controlled
              consent system protects your privacy.
            </p>
          </div>
          <div className="banner-actions">
            <Link to="/book-appointment" className="btn btn-primary">
              Book Appointment <ArrowRightIcon size={14} />
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
