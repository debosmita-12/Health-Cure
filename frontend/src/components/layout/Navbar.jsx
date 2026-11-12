import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Brand from "../common/Brand";
import { useAuth } from "../../context/AuthContext";
import { ArrowRightIcon, CloseIcon, MenuIcon, SearchIcon, UsersIcon } from "../icons/icons";
import { searchIndex } from "../../data/content";

const publicNavLinks = [
  { label: "Home", targetId: "hero", to: "/" },
  { label: "Services", targetId: "services", to: "/services" },
  { label: "About", targetId: "about", to: "/about" },
  { label: "Contact", targetId: "contact", to: "/contact" },
  { label: "Developers", targetId: "developers", to: "/#developers" },
];

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("hero");

  const location = useLocation();
  const navigate = useNavigate();

  // Normalize role label (never Superadmin)
  const displayRole = role === "SUPERADMIN" || role === "ADMIN" ? "Admin" : role === "DOCTOR" ? "Doctor" : "Patient";

  // Handle URL hash on initial load or navigation
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.pathname, location.hash]);

  // Track active section on home page
  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = ["hero", "services", "about", "contact", "developers"];
    function handleScroll() {
      const scrollPos = window.scrollY + 140;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

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

  function handlePublicNavClick(e, link) {
    if (location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(link.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", link.targetId === "hero" ? "/" : `/#${link.targetId}`);
        setActiveSection(link.targetId);
      }
    } else {
      e.preventDefault();
      navigate(link.targetId === "hero" ? "/" : `/#${link.targetId}`);
    }
    setOpen(false);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function goTo(path) {
    setSearchOpen(false);
    setQuery("");
    navigate(path);
  }

  const portalDashboardPath =
    role === "PATIENT"
      ? "/patient/dashboard"
      : role === "DOCTOR"
      ? "/doctor/dashboard"
      : "/admin/dashboard";

  return (
    <header className="site-header">
      <div className="container nav-container">
        {/* Left: Brand Logo */}
        <Link to="/" className="brand-link" aria-label="Health &amp; Cure home">
          <Brand />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Primary Navigation">
          {!isAuthenticated ? (
            /* Unauthenticated / Public Visitors */
            publicNavLinks.map((link) => {
              const isSectionActive =
                location.pathname === "/"
                  ? activeSection === link.targetId
                  : location.pathname === link.to;

              return (
                <a
                  key={link.label}
                  href={link.targetId === "hero" ? "/" : `/#${link.targetId}`}
                  className={isSectionActive ? "nav-link active" : "nav-link"}
                  onClick={(e) => handlePublicNavClick(e, link)}
                >
                  {link.label}
                </a>
              );
            })
          ) : role === "PATIENT" ? (
            /* Patient Portal Navigation */
            <>
              <NavLink to="/patient/dashboard" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Dashboard
              </NavLink>
              <NavLink to="/patient/my-appointments" className="nav-link">
                Appointments
              </NavLink>
              <NavLink to="/patient/medical-documents" className="nav-link">
                My Records
              </NavLink>
              <NavLink to="/patient/privacy-consent" className="nav-link">
                Consent Control
              </NavLink>
            </>
          ) : role === "DOCTOR" ? (
            /* Doctor Portal Navigation (NO BOOK APPOINTMENT) */
            <>
              <NavLink to="/doctor/dashboard" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Dashboard
              </NavLink>
              <NavLink to="/doctor/all-appointments" className="nav-link">
                Appointments
              </NavLink>
              <NavLink to="/doctor/patient-history" className="nav-link">
                Patient Consents
              </NavLink>
            </>
          ) : role === "SUPERADMIN" || role === "ADMIN" ? (
            /* Admin Navigation (Canonical Role: ADMIN) */
            <>
              <NavLink to="/admin/dashboard" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/doctor-directory" className="nav-link">
                Doctors Queue
              </NavLink>
              <NavLink to="/admin/audit-logs" className="nav-link">
                Audit Trail
              </NavLink>
            </>
          ) : null}
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

          {!isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <Link to="/login" className="nav-link" style={{ fontWeight: 600, color: "var(--color-text-title)" }}>
                Login
              </Link>
              <Link
                to="/book-appointment"
                className="btn btn-primary nav-cta"
                style={{ padding: "9px 22px", borderRadius: "9999px", fontWeight: 600, fontSize: "0.88rem" }}
              >
                Book Appointment &rarr;
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link to={portalDashboardPath} className="nav-user-chip" title="Go to my portal">
                <UsersIcon size={16} />
                <span>{user?.firstName || displayRole} ({displayRole.toLowerCase()})</span>
              </Link>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                Logout
              </button>
            </div>
          )}

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

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="search-dropdown-backdrop"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="container search-dropdown-container"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="search-input-wrap">
              <SearchIcon size={18} />
              <input
                id="site-search"
                autoFocus
                value={query}
                placeholder="Search services, records, security rules, departments..."
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
            {!isAuthenticated ? (
              <>
                {publicNavLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.targetId === "hero" ? "/" : `/#${link.targetId}`}
                    className="mobile-link"
                    onClick={(e) => handlePublicNavClick(e, link)}
                  >
                    {link.label}
                  </a>
                ))}
              </>
            ) : role === "PATIENT" ? (
              <>
                <Link to="/patient/dashboard" className="mobile-link" onClick={() => setOpen(false)}>
                  Patient Dashboard
                </Link>
                <Link to="/patient/my-appointments" className="mobile-link" onClick={() => setOpen(false)}>
                  My Appointments
                </Link>
                <Link to="/patient/medical-documents" className="mobile-link" onClick={() => setOpen(false)}>
                  Medical Vault
                </Link>
              </>
            ) : role === "DOCTOR" ? (
              <>
                <Link to="/doctor/dashboard" className="mobile-link" onClick={() => setOpen(false)}>
                  Doctor Clinical Workspace
                </Link>
                <Link to="/doctor/all-appointments" className="mobile-link" onClick={() => setOpen(false)}>
                  My Appointments
                </Link>
              </>
            ) : role === "SUPERADMIN" || role === "ADMIN" ? (
              <>
                <Link to="/admin/dashboard" className="mobile-link" onClick={() => setOpen(false)}>
                  Admin Management Console
                </Link>
                <Link to="/admin/doctor-directory" className="mobile-link" onClick={() => setOpen(false)}>
                  Doctor Directory
                </Link>
              </>
            ) : null}
          </nav>
          <div className="mobile-actions">
            {!isAuthenticated ? (
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <Link to="/register" className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }} onClick={() => setOpen(false)}>
                  Register
                </Link>
                <Link to="/login" className="btn btn-primary" style={{ flex: 1, textAlign: "center" }} onClick={() => setOpen(false)}>
                  Login
                </Link>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={handleLogout}
              >
                Logout ({user?.firstName || displayRole})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
