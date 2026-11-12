import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

export default function SiteLayout() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    prevPathRef.current = location.pathname;

    // Check if both previous and current paths are within the same portal section
    const isSamePortal =
      (prevPath.startsWith("/patient") && location.pathname.startsWith("/patient")) ||
      (prevPath.startsWith("/doctor") && location.pathname.startsWith("/doctor")) ||
      (prevPath.startsWith("/admin") && location.pathname.startsWith("/admin"));

    // Do NOT scroll or redirect upwards when user selects items from the sidebar in a portal!
    if (!isSamePortal) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.pathname, location.search]);

  return (
    <div
      className="site-layout-wrapper"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <Navbar />
      <main
        id="content"
        style={{
          flex: "1 0 auto",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
