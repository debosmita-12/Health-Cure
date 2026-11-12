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

        {/* Center: Desktop Navigation — Common Public Navigation for All Visitors & Users */}
        <nav className="desktop-nav" aria-label="Primary Navigation">
          {publicNavLinks.map((link) => {
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
          })}
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
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link to="/login" className="nav-link" style={{ fontWeight: 600, color: "var(--color-text-title)" }}>
                Login
              </Link>
              <Link
                to="/register"
                className="ref-btn-primary"
                style={{ padding: "10px 22px", fontSize: "0.88rem" }}
              >
                Register →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                to={portalDashboardPath}
                className="ref-btn-primary"
                style={{ padding: "10px 22px", fontSize: "0.88rem" }}
                title="Go to my portal dashboard"
              >
                <UsersIcon size={16} />
                <span>My Dashboard</span>
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
            {isAuthenticated && (
              <Link
                to={portalDashboardPath}
                className="mobile-link"
                style={{ fontWeight: 700, color: "var(--color-primary)" }}
                onClick={() => setOpen(false)}
              >
                My Dashboard ({user?.firstName || displayRole})
              </Link>
            )}
          </nav>
          <div className="mobile-actions">
            {!isAuthenticated ? (
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <Link to="/register" className="ref-btn-primary" style={{ flex: 1, textAlign: "center", justifyContent: "center" }} onClick={() => setOpen(false)}>
                  Register →
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }} onClick={() => setOpen(false)}>
                  Login
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <Link
                  to={portalDashboardPath}
                  className="ref-btn-primary"
                  style={{ width: "100%", textAlign: "center", justifyContent: "center" }}
                  onClick={() => setOpen(false)}
                >
                  <UsersIcon size={16} />
                  <span>My Dashboard</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={handleLogout}
                >
                  Logout ({user?.firstName || displayRole})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
