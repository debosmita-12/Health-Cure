import { Link } from "react-router-dom";
import Brand from "../common/Brand";
import {
  SocialFacebookIcon,
  SocialInstagramIcon,
  SocialLinkedinIcon,
  SocialYoutubeIcon,
} from "../icons/icons";

const links = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Patient Info", to: "/how-it-works" },
  { label: "Security Rules", to: "/security-rules" },
  { label: "Book Appointment", to: "/book-appointment" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        {/* Left: Brand with left-aligned Tagline directly below */}
        <div className="footer-brand-block">
          <Link to="/" className="brand-link" aria-label="Health & Cure home">
            <Brand compact />
          </Link>
          <div className="footer-tagline">
            <p>
              A HEALTHIER TOMORROW
              <br />
              STARTS WITH A CONNECTED RECORD.
            </p>
          </div>
        </div>

        {/* Center: Nav Links */}
        <nav className="footer-nav" aria-label="Footer Navigation">
          {links.map((link) => (
            <Link key={link.label} to={link.to} className="footer-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="footer-socials" aria-label="Social Links">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="social-icon-btn"
            aria-label="Instagram"
          >
            <SocialInstagramIcon size={18} />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="social-icon-btn"
            aria-label="Facebook"
          >
            <SocialFacebookIcon size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="social-icon-btn"
            aria-label="LinkedIn"
          >
            <SocialLinkedinIcon size={18} />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="social-icon-btn"
            aria-label="YouTube"
          >
            <SocialYoutubeIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
