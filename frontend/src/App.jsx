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
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
