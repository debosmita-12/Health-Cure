import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

export default function SiteLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
