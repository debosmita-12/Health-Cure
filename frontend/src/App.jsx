import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import AboutPage from "./pages/public/AboutPage";
import BookAppointmentPage from "./pages/public/BookAppointmentPage";
import ContactPage from "./pages/public/ContactPage";
import GetStartedPage from "./pages/public/GetStartedPage";
import HomePage from "./pages/public/HomePage";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import LoginPage from "./pages/public/LoginPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import SecurityRulesPage from "./pages/public/SecurityRulesPage";
import ServicesPage from "./pages/public/ServicesPage";
import PatientDashboard from "./pages/portal/PatientDashboard";
import DoctorDashboard from "./pages/portal/DoctorDashboard";
import AdminDashboard from "./pages/portal/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/security-rules" element={<SecurityRulesPage />} />
            <Route path="/security" element={<SecurityRulesPage />} />
            <Route path="/book-appointment" element={<BookAppointmentPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/get-started" element={<GetStartedPage />} />

            {/* Authenticated Role Portals */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["SUPERADMIN", "ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
