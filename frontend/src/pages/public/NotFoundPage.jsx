import { Link } from "react-router-dom";
import { ArrowRightIcon, ShieldIcon } from "../../components/icons/icons";

export default function NotFoundPage() {
  return (
    <div className="subpage not-found-page">
      <div className="container">
        <div className="not-found-card">
          <div className="not-found-icon">
            <ShieldIcon size={48} />
          </div>
          <p className="eyebrow-text">404 — PAGE NOT FOUND</p>
          <h1 className="subpage-main-title">
            Looking for a Medical Page?
          </h1>
          <p className="subpage-lede">
            The page you requested could not be located. It may have moved or been updated.
            Use the links below to return to the verified healthcare platform.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              Return to Homepage <ArrowRightIcon size={14} />
            </Link>
            <Link to="/services" className="btn btn-secondary">
              Browse All Services
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
