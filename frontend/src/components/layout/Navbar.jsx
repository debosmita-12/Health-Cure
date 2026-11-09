import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Brand from "../common/Brand";
import { ArrowRightIcon, CloseIcon, MenuIcon, SearchIcon } from "../icons/icons";
import { searchIndex } from "../../data/content";

const links = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Patient Info", to: "/how-it-works" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle("nav-lock", open || searchOpen);
    return () => document.body.classList.remove("nav-lock");
  }, [open, searchOpen]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return searchIndex.slice(0, 6);
    return searchIndex.filter((item) =>
      `${item.title} ${item.detail}`.toLowerCase().includes(term)
    );
  }, [query]);

  function goTo(path) {
    setSearchOpen(false);
    setQuery("");
    navigate(path);
  }

  return (
    <header className="site-header">
      <div className="container nav-container">
        {/* Left: Brand Logo */}
        <Link to="/" className="brand-link" aria-label="Health & Cure home">
          <Brand />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Primary Navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="nav-actions">
          <button
            className="icon-button search-toggle-btn"
            type="button"
            aria-label="Search pages"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((value) => !value);
              setOpen(false);
            }}
          >
            <SearchIcon size={20} />
          </button>

          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/book-appointment" className="btn btn-primary nav-cta">
            Book Appointment <ArrowRightIcon size={14} />
          </Link>

          <button
            className="icon-button menu-button"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => {
              setOpen((value) => !value);
              setSearchOpen(false);
            }}
          >
            {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-layer" role="presentation" onClick={() => setSearchOpen(false)}>
          <div
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="search-header">
              <label htmlFor="site-search" className="search-label">
                Search Health &amp; Cure
              </label>
              <button
                type="button"
                className="icon-button close-search-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="search-input-wrap">
              <SearchIcon size={18} />
              <input
                id="site-search"
                autoFocus
                value={query}
                placeholder="Search services, records, security rules, booking..."
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <ul className="search-results-list">
              {results.length === 0 ? (
                <li className="empty-result">No matching pages found.</li>
              ) : (
                results.map((item) => (
                  <li key={`${item.path}-${item.title}`}>
                    <button type="button" onClick={() => goTo(item.path)}>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {open && (
        <div className="mobile-panel">
          <nav className="mobile-nav-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => (isActive ? "mobile-link active" : "mobile-link")}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/security-rules"
              className={({ isActive }) => (isActive ? "mobile-link active" : "mobile-link")}
            >
              Security Rules
            </NavLink>
          </nav>
          <div className="mobile-actions">
            <Link to="/login" className="btn btn-secondary mobile-login">
              Login to Portal
            </Link>
            <Link to="/book-appointment" className="btn btn-primary mobile-cta">
              Book Appointment <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
