import {
  SocialFacebookIcon,
  SocialInstagramIcon,
  SocialLinkedinIcon,
  SocialYoutubeIcon,
} from "../icons/icons";

const socialLinks = [
  {
    name: "Instagram",
    icon: SocialInstagramIcon,
    url: import.meta.env.VITE_INSTAGRAM_URL || "",
  },
  {
    name: "Facebook",
    icon: SocialFacebookIcon,
    url: import.meta.env.VITE_FACEBOOK_URL || "",
  },
  {
    name: "LinkedIn",
    icon: SocialLinkedinIcon,
    url: import.meta.env.VITE_LINKEDIN_URL || "",
  },
  {
    name: "YouTube",
    icon: SocialYoutubeIcon,
    url: import.meta.env.VITE_YOUTUBE_URL || "",
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        {/* A. Copyright Information */}
        <p className="footer-copyright">
          &copy; 2026 Health &amp; Cure. All Rights Reserved.
        </p>

        {/* B. Healthcare Message */}
        <p className="footer-healthcare-message">
          Your health, your records, your care &mdash; connected securely for a healthier tomorrow.
        </p>

        {/* C. Social Media & Contact Icons */}
        <div className="footer-socials" aria-label="Social and Contact Channels">
          {socialLinks.map(({ name, icon: Icon, url }) =>
            url ? (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={name}
              >
                <Icon size={18} />
              </a>
            ) : (
              <button
                key={name}
                type="button"
                className="social-icon-btn"
                aria-label={name}
                onClick={(e) => e.preventDefault()}
              >
                <Icon size={18} />
              </button>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
