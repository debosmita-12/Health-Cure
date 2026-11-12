import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroVisual from "../../assets/hero-mockup-visual.png";
import api from "../../services/api";
import {
  ArrowRightIcon,
  CheckIcon,
  DoctorIcon,
  HeartIcon,
  HospitalIcon,
  LightningIcon,
  LockIcon,
  PillIcon,
  PulseIcon,
  RecordsIcon,
  SearchIcon,
  ShieldIcon,
  SupportIcon,
  UsersIcon,
} from "../../components/icons/icons";

// Refined icons
function CalendarStepIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <circle cx="16" cy="14" r="1" fill="currentColor" />
      <circle cx="8" cy="18" r="1" fill="currentColor" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function DoctorStepIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
      <path d="M10 14.5l2 3 2-3" />
      <path d="M12 17.5v2.5" />
    </svg>
  );
}

function ClipboardStepIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  );
}

function HeartPulseStepIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      <path d="M8.5 12.5h2l1 -2l2 4l1 -2h2" />
    </svg>
  );
}

function LeafCorner({ className }) {
  return (
    <svg className={className} width="80" height="80" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M20 80 Q 40 40 85 25 Q 70 65 30 75 Z" fill="#BCE3D2" stroke="#5E8F7C" strokeWidth="1.5" opacity="0.75" />
      <path d="M30 85 Q 10 55 35 30 Q 55 50 35 80 Z" fill="#D5EFE3" stroke="#5E8F7C" strokeWidth="1.5" opacity="0.8" />
      <path d="M15 90 C 35 65 60 45 85 25" stroke="#5E8F7C" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const DEVELOPERS = [
  { id: "dev-1", name: "Debosmita Mukhopadhyay" },
  { id: "dev-2", name: "Muthu Amuthan" },
  { id: "dev-3", name: "Amanjeeta Rath" },
  { id: "dev-4", name: "Khushi Kumari" },
];

const PLATFORM_SERVICES = [
  {
    title: "Doctor Discovery",
    desc: "Search, filter, and connect with certified and verified medical specialists across diverse clinical departments.",
    icon: DoctorIcon,
  },
  {
    title: "Healthcare Management",
    desc: "Coordinated clinical care pathways connecting patients, attending physicians, and administrative oversight.",
    icon: HospitalIcon,
  },
  {
    title: "Appointment Coordination",
    desc: "Structured scheduling with conflict detection, automated doctor assignment, and real-time status updates.",
    icon: CalendarStepIcon,
  },
  {
    title: "Digital Medical Records",
    desc: "Encrypted longitudinal patient health records, diagnostic investigation results, and consultation summaries.",
    icon: RecordsIcon,
  },
  {
    title: "Prescription Management",
    desc: "Direct digital prescription issuance by verified doctors with dosages, instructions, and printable formats.",
    icon: PillIcon,
  },
  {
    title: "Laboratory & Diagnostics",
    desc: "Integrated catalog of medical tests with online sample booking and verified report release.",
    icon: PulseIcon,
  },
  {
    title: "Online Consultation",
    desc: "Remote telemedicine consultations, virtual triage, and follow-up communication.",
    icon: SupportIcon,
  },
  {
    title: "Healthcare Communication",
    desc: "Confidential communication and follow-up queries between patients and authorized clinicians.",
    icon: UsersIcon,
  },
];

export default function HomePage() {
  // Live Database State
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalDepartments: 0, completedAppointments: 0 });
  const [testimonials, setTestimonials] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  // Contact form state
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "", subject: "General Enquiry", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    async function loadPublicData() {
      try {
        const [docsRes, deptsRes, statsRes, testRes] = await Promise.allSettled([
          api.get("/api/doctors/public"),
          api.get("/api/public/departments"),
          api.get("/api/public/stats"),
          api.get("/api/public/testimonials"),
        ]);

        if (docsRes.status === "fulfilled" && Array.isArray(docsRes.value.data)) {
          setDoctors(docsRes.value.data);
        }
        if (deptsRes.status === "fulfilled" && Array.isArray(deptsRes.value.data)) {
          setDepartments(deptsRes.value.data);
        }
        if (statsRes.status === "fulfilled" && statsRes.value.data) {
          setStats(statsRes.value.data);
        }
        if (testRes.status === "fulfilled" && Array.isArray(testRes.value.data)) {
          setTestimonials(testRes.value.data);
        }
      } catch (err) {
        console.warn("Public data loading exception:", err);
      }
    }
    loadPublicData();
  }, []);

  async function handleContactSubmit(e) {
    e.preventDefault();
    setContactSuccess("");
    setContactError("");

    if (!contactData.name.trim() || !contactData.email.trim() || !contactData.message.trim()) {
      setContactError("Please fill in your name, email, and message.");
      return;
    }

    setContactLoading(true);
    try {
      const res = await api.post("/api/public/contact", contactData);
      setContactSuccess(res.data?.message || "Thank you. Your message has been received.");
      setContactData({ name: "", email: "", phone: "", subject: "General Enquiry", message: "" });
    } catch (err) {
      setContactError(err.response?.data?.error || "Unable to send your message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  }

  const filteredDoctors = doctors.filter((doc) => {
    const searchTarget = `${doc.first_name || ""} ${doc.last_name || ""} ${doc.specialisation || ""} ${doc.department_name || ""}`.toLowerCase();
    const nameMatch = !doctorSearch || searchTarget.includes(doctorSearch.toLowerCase());
    
    if (selectedDept === "ALL") return nameMatch;
    
    const targetDept = selectedDept.toLowerCase();
    const docDept = (doc.department_name || "").toLowerCase();
    const docSpec = (doc.specialisation || "").toLowerCase();
    const keyword = targetDept.split("&")[0].trim();

    const deptMatch =
      (docDept && (docDept.includes(targetDept) || targetDept.includes(docDept) || docDept.includes(keyword))) ||
      (docSpec && (docSpec.includes(targetDept) || docSpec.includes(keyword)));

    return nameMatch && deptMatch;
  });

  return (
    <div className="home-page ref-home-exact">
      {/* Decorative ambient plus marks in background */}
      <span className="ref-floating-plus p1" aria-hidden="true">+</span>
      <span className="ref-floating-plus p2" aria-hidden="true">+</span>
      <span className="ref-floating-plus p3" aria-hidden="true">+</span>
      <span className="ref-floating-plus p4" aria-hidden="true">+</span>
      <span className="ref-floating-plus p5" aria-hidden="true">+</span>

      {/* ========================================================
          1. HERO SECTION
          ======================================================== */}
      <section className="ref-hero-section" id="hero" aria-label="Hero Overview">
        <div className="container">
          <div className="ref-hero-grid">
            {/* Left Column: Hero Copy */}
            <div className="hero-copy">
              <p className="eyebrow-text">CARING TODAY FOR BRIGHTER TOMORROWS</p>

              <h1 className="ref-hero-headline">
                Your Health
                <br />
                <span className="ref-priority-wrapper">
                  Our Priority.
                  <svg className="ref-priority-arc" viewBox="0 0 140 18" fill="none" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 14C45 2 95 2 136 14" stroke="#48A682" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="ref-hero-desc">
                Connect with trusted healthcare professionals, access quality care, and manage your health — all in one place.
              </p>

              <div className="ref-hero-buttons">
                <a href="#services" className="ref-btn-primary">
                  Explore Our Services →
                </a>
                <a href="#about" className="ref-btn-secondary">
                  <span className="ref-btn-play-circle">
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
                      <polygon points="2.5,1.5 8.5,5 2.5,8.5" />
                    </svg>
                  </span>
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Column: Hero Visual from Reference Image */}
            <div className="ref-hero-visual-container">
              <img
                src={heroVisual}
                alt="Health & Cure doctor consultation with patient and trusted care badges"
                className="ref-hero-img-exact"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. FEATURE STRIP (4-item bar from Reference Image)
          ======================================================== */}
      <div className="container">
        <div className="ref-feature-strip-bar">
          <div className="ref-strip-item">
            <div className="ref-strip-icon"><ShieldIcon size={20} /></div>
            <span>Verified Professionals</span>
          </div>

          <div className="ref-strip-item">
            <div className="ref-strip-icon"><HeartIcon size={20} /></div>
            <span>Secure &amp; Private</span>
          </div>

          <div className="ref-strip-item">
            <div className="ref-strip-icon"><LightningIcon size={20} /></div>
            <span>Digital Health Records</span>
          </div>

          <div className="ref-strip-item">
            <div className="ref-strip-icon"><SupportIcon size={20} /></div>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. WHY CHOOSE HEALTH & CURE (3 Cards from Reference Image)
          ======================================================== */}
      <section className="ref-why-section" id="why-choose" aria-label="Why Choose Health and Cure">
        <div className="container">
          <div className="ref-why-header">
            <p className="eyebrow">WHY CHOOSE HEALTH &amp; CURE</p>
            <div className="ref-why-title-wrap">
              <span className="ref-title-line" aria-hidden="true" />
              <h2>A Smarter Way to Healthcare</h2>
              <span className="ref-title-line" aria-hidden="true" />
            </div>
          </div>

          <div className="ref-why-grid">
            {/* Card 1 */}
            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <UsersIcon size={24} />
              </div>
              <div className="ref-why-body">
                <h3>For Everyone</h3>
                <p>Dedicated tools for patients, clinical workflows for doctors, and transparent operations for administrators.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <ShieldIcon size={24} />
              </div>
              <div className="ref-why-body">
                <h3>Trusted &amp; Secure</h3>
                <p>Role-based access boundaries, patient-consented medical history, and encrypted health records.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="ref-why-card">
              <div className="ref-why-icon-box">
                <LightningIcon size={24} />
              </div>
              <div className="ref-why-body">
                <h3>Accessible Anytime</h3>
                <p>Digital medical records, diagnostic tests, verified prescriptions, and communication in one portal.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. SERVICES SECTION
          ======================================================== */}
      <section className="ref-services-section" id="services" style={{ padding: "80px 0", background: "var(--color-mint-bg)" }}>
        <div className="container">
          <div className="ref-why-header" style={{ marginBottom: "40px" }}>
            <p className="eyebrow">COMPREHENSIVE HEALTHCARE</p>
            <div className="ref-why-title-wrap">
              <span className="ref-title-line" aria-hidden="true" />
              <h2>Our Platform Services</h2>
              <span className="ref-title-line" aria-hidden="true" />
            </div>
            <p style={{ maxWidth: "600px", margin: "14px auto 0", color: "var(--color-text-body)", fontSize: "1rem" }}>
              Explore the integrated clinical and administrative capabilities designed for patients, doctors, and healthcare administration.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "24px" }}>
            {PLATFORM_SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  style={{
                    background: "var(--color-white)",
                    borderRadius: "16px",
                    padding: "28px 24px",
                    border: "1px solid var(--color-border-subtle)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "#EEF8F3",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "18px",
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: "1.18rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "8px" }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-body)", lineHeight: 1.55, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          5. ABOUT HEALTH & CURE
          ======================================================== */}
      <section id="about" style={{ padding: "80px 0", background: "var(--color-white)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "50px", alignItems: "center" }}>
            <div>
              <p className="eyebrow-text">ABOUT THE PLATFORM</p>
              <h2 style={{ fontSize: "2.4rem", color: "var(--color-primary)", fontWeight: 800, lineHeight: 1.15, marginBottom: "20px" }}>
                Connected Healthcare Built on Trust and Clinical Integrity.
              </h2>
              <p style={{ fontSize: "1.05rem", color: "var(--color-text-body)", lineHeight: 1.65, marginBottom: "16px" }}>
                Health &amp; Cure is an integrated healthcare management platform uniting Patients, Verified Doctors, and Operational Administrators. By bridging clinical documentation with strict role boundaries, we ensure patients own their medical records and doctors deliver informed, compassionate care.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-text-title)", fontWeight: 600 }}>
                  <span style={{ color: "var(--color-sage)" }}><CheckIcon size={18} /></span>
                  Strict zero-trust consent: doctors access patient history only with active consent or confirmed visits.
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-text-title)", fontWeight: 600 }}>
                  <span style={{ color: "var(--color-sage)" }}><CheckIcon size={18} /></span>
                  Full clinical verification: every doctor is vetted by administrators before receiving credentials.
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-text-title)", fontWeight: 600 }}>
                  <span style={{ color: "var(--color-sage)" }}><CheckIcon size={18} /></span>
                  Spring Boot + Spring JDBC architecture for auditable, resilient healthcare data persistence.
                </li>
              </ul>
              <div style={{ display: "flex", gap: "16px", marginTop: "28px" }}>
                <Link to="/register" className="ref-btn-primary">
                  Join Health &amp; Cure →
                </Link>
                <Link to="/developers" className="ref-btn-secondary">
                  Meet the Developers
                </Link>
              </div>
            </div>

            <div style={{ background: "var(--color-mint-bg)", borderRadius: "24px", padding: "36px", border: "1px solid rgba(23, 76, 64, 0.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  <strong style={{ display: "block", fontSize: "2rem", color: "var(--color-primary)", fontWeight: 800 }}>
                    {stats.totalDoctors || "50+"}
                  </strong>
                  <span style={{ fontSize: "0.88rem", color: "var(--color-text-muted)" }}>Verified Doctors</span>
                </div>
                <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  <strong style={{ display: "block", fontSize: "2rem", color: "var(--color-primary)", fontWeight: 800 }}>
                    {stats.totalPatients || "50+"}
                  </strong>
                  <span style={{ fontSize: "0.88rem", color: "var(--color-text-muted)" }}>Active Patients</span>
                </div>
                <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  <strong style={{ display: "block", fontSize: "2rem", color: "var(--color-primary)", fontWeight: 800 }}>
                    {stats.totalDepartments || "10"}
                  </strong>
                  <span style={{ fontSize: "0.88rem", color: "var(--color-text-muted)" }}>Clinical Departments</span>
                </div>
                <div style={{ background: "#FFFFFF", padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  <strong style={{ display: "block", fontSize: "2rem", color: "var(--color-primary)", fontWeight: 800 }}>
                    {stats.completedAppointments || "25+"}
                  </strong>
                  <span style={{ fontSize: "0.88rem", color: "var(--color-text-muted)" }}>Consultations Handled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. DOCTOR DIRECTORY (Live Database)
          ======================================================== */}
      <section id="doctors" style={{ padding: "80px 0", background: "var(--color-mint-bg)" }}>
        <div className="container">
          <div className="ref-why-header" style={{ marginBottom: "32px" }}>
            <p className="eyebrow">MEDICAL SPECIALISTS</p>
            <div className="ref-why-title-wrap">
              <span className="ref-title-line" aria-hidden="true" />
              <h2>Verified Doctor Directory</h2>
              <span className="ref-title-line" aria-hidden="true" />
            </div>
            <p style={{ maxWidth: "600px", margin: "14px auto 0", color: "var(--color-text-body)", fontSize: "1rem" }}>
              Explore certified physicians across departments. Only approved and active medical practitioners are listed.
            </p>
          </div>

          {/* Filters & Search */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "32px" }}>
            <div style={{ position: "relative", minWidth: "280px", flex: 1 }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}>
                <SearchIcon size={18} />
              </span>
              <input
                type="text"
                placeholder="Search doctors by name or specialty..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border-subtle)",
                  fontSize: "0.95rem",
                  background: "#FFFFFF",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={`btn ${selectedDept === "ALL" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "8px 16px", borderRadius: "9999px", fontSize: "0.85rem" }}
                onClick={() => setSelectedDept("ALL")}
              >
                All Departments
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`btn ${selectedDept === d.name ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "8px 16px", borderRadius: "9999px", fontSize: "0.85rem" }}
                  onClick={() => setSelectedDept(d.name)}
                >
                  {d.name.split("&")[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Cards */}
          {filteredDoctors.length === 0 ? (
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "48px 20px", textAlign: "center", border: "1px solid var(--color-border-subtle)" }}>
              <DoctorIcon size={40} />
              <h4 style={{ margin: "16px 0 6px", color: "var(--color-primary)" }}>No Doctors Found</h4>
              <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Try clearing your search query or department filter.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.doctor_id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    border: "1px solid var(--color-border-subtle)",
                    padding: "24px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "#EEF8F3",
                        color: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #D1FAE5",
                      }}
                    >
                      <DoctorIcon size={28} />
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "var(--color-primary)" }}>
                        {(() => {
                          const fullName = `${doc.first_name || ""} ${doc.last_name || ""}`.trim();
                          return fullName.startsWith("Dr.") ? fullName : `Dr. ${fullName}`;
                        })()}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-sage)", fontWeight: 600 }}>
                        {doc.specialisation || "General Specialist"}
                      </p>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-body)", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px", flex: 1 }}>
                    <div><strong>Department:</strong> {doc.department_name || doc.specialisation || "General Medicine"}</div>
                    <div><strong>Qualifications:</strong> {doc.qualification || "MBBS, MD"}</div>
                    <div><strong>Experience:</strong> {doc.experience_years} years</div>
                    <div><strong>Affiliation:</strong> {doc.hospital_affiliation || "Health & Cure Care Network"}</div>
                    <div><strong>Consultation Fee:</strong> ₹{doc.consultation_fee ? Number(doc.consultation_fee).toFixed(0) : "750"}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid var(--color-border-subtle)" }}>
                    <span style={{ fontSize: "0.8rem", color: doc.is_available ? "#10B981" : "#EF4444", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: doc.is_available ? "#10B981" : "#EF4444" }} />
                      {doc.is_available ? "Available for Care" : "Currently Offline"}
                    </span>
                    <Link
                      to="/login"
                      style={{ fontSize: "0.82rem", color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}
                    >
                      Sign In to Consult →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          7. HOW IT WORKS
          ======================================================== */}
      <section className="ref-how-section" id="how-it-works" aria-label="How It Works">
        <div className="container">
          <div className="ref-how-header">
            <span className="ref-how-line" aria-hidden="true" />
            <h2>How It Works</h2>
            <span className="ref-how-line" aria-hidden="true" />
          </div>

          <div className="ref-how-row">
            <div className="ref-how-item">
              <div className="ref-how-icon-circle">
                <CalendarStepIcon />
              </div>
              <span className="ref-how-label">Register &amp;<br />Discover Care</span>
            </div>

            <span className="ref-how-arrow-mark" aria-hidden="true">→</span>

            <div className="ref-how-item">
              <div className="ref-how-icon-circle">
                <DoctorStepIcon />
              </div>
              <span className="ref-how-label">Consult with a<br />Professional</span>
            </div>

            <span className="ref-how-arrow-mark" aria-hidden="true">→</span>

            <div className="ref-how-item">
              <div className="ref-how-icon-circle">
                <ClipboardStepIcon />
              </div>
              <span className="ref-how-label">Access Digital<br />Health Records</span>
            </div>

            <span className="ref-how-arrow-mark" aria-hidden="true">→</span>

            <div className="ref-how-item">
              <div className="ref-how-icon-circle">
                <HeartPulseStepIcon />
              </div>
              <span className="ref-how-label">Stay Healthier,<br />Happier</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. TESTIMONIALS & REVIEWS (Live Database)
          ======================================================== */}
      {testimonials.length > 0 && (
        <section id="testimonials" style={{ padding: "70px 0", background: "var(--color-white)" }}>
          <div className="container">
            <div className="ref-why-header" style={{ marginBottom: "36px" }}>
              <p className="eyebrow">VERIFIED EXPERIENCES</p>
              <div className="ref-why-title-wrap">
                <span className="ref-title-line" aria-hidden="true" />
                <h2>Patient Reviews &amp; Feedback</h2>
                <span className="ref-title-line" aria-hidden="true" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "var(--color-mint-bg)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "16px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ color: "#F59E0B", marginBottom: "10px", fontSize: "1.1rem" }}>
                    {"★".repeat(t.rating)}
                  </div>
                  <p style={{ fontSize: "0.95rem", color: "var(--color-text-body)", fontStyle: "italic", flex: 1, margin: "0 0 16px" }}>
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: 700 }}>
                    Patient: {t.patient_first_name || "Verified Patient"}
                    <span style={{ display: "block", fontSize: "0.78rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                      Consulted Dr. {t.doctor_first_name} {t.doctor_last_name} ({t.doctor_specialisation})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          9. CONTACT SECTION (Working Enquiry Form)
          ======================================================== */}
      <section id="contact" style={{ padding: "80px 0", background: "var(--color-mint-bg)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "50px", alignItems: "flex-start" }}>
            <div>
              <p className="eyebrow-text">GET IN TOUCH</p>
              <h2 style={{ fontSize: "2.3rem", color: "var(--color-primary)", fontWeight: 800, marginBottom: "18px" }}>
                Connect with Health &amp; Cure Coordination Desk.
              </h2>
              <p style={{ fontSize: "1rem", color: "var(--color-text-body)", lineHeight: 1.6, marginBottom: "28px" }}>
                Have questions regarding clinical departments, verified physician credentials, or administrative integrations? Submit an enquiry and our coordination team will assist you.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#FFFFFF", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HospitalIcon size={20} />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "var(--color-text-title)" }}>Central Coordination Office</strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Health &amp; Cure Connected Care Centre</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#FFFFFF", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SupportIcon size={20} />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "var(--color-text-title)" }}>Helpline &amp; Support</strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>+91 9051579029 | support@healthcure.local</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Form */}
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "36px", border: "1px solid var(--color-border-subtle)", boxShadow: "0 6px 20px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "1.3rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "20px" }}>
                Send a Message
              </h3>

              {contactSuccess && (
                <div style={{ background: "#D1FAE5", border: "1px solid #10B981", color: "#065F46", padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "0.9rem" }}>
                  {contactSuccess}
                </div>
              )}
              {contactError && (
                <div style={{ background: "#FEE2E2", border: "1px solid #EF4444", color: "#991B1B", padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "0.9rem" }}>
                  {contactError}
                </div>
              )}

              <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-title)", marginBottom: "6px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    placeholder="Enter your name"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.9rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-title)", marginBottom: "6px" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.9rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-title)", marginBottom: "6px" }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      placeholder="+91 9051579029"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.9rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-title)", marginBottom: "6px" }}>
                    Subject
                  </label>
                  <select
                    value={contactData.subject}
                    onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.9rem", background: "#FFFFFF" }}
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Doctor Application Query">Doctor Application Query</option>
                    <option value="Patient Records Assistance">Patient Records Assistance</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-title)", marginBottom: "6px" }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    placeholder="Describe how we can assist you..."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-border-subtle)", fontSize: "0.9rem" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="ref-btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: "6px" }}
                >
                  {contactLoading ? "Sending Enquiry..." : "Submit Enquiry"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          10. DEVELOPERS SECTION
          ======================================================== */}
      <section id="developers" style={{ padding: "80px 0", background: "var(--color-white)" }}>
        <div className="container">
          <div className="ref-why-header" style={{ marginBottom: "36px" }}>
            <p className="eyebrow">ENGINEERING &amp; ARCHITECTURE</p>
            <div className="ref-why-title-wrap">
              <span className="ref-title-line" aria-hidden="true" />
              <h2>Meet Our Developers</h2>
              <span className="ref-title-line" aria-hidden="true" />
            </div>
            <p style={{ maxWidth: "600px", margin: "14px auto 0", color: "var(--color-text-body)", fontSize: "1rem" }}>
              The software engineering team behind the design and implementation of Health &amp; Cure.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {DEVELOPERS.map((dev) => (
              <div
                key={dev.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "16px",
                  padding: "26px 20px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "#EEF8F3",
                    color: "var(--color-primary)",
                    margin: "0 auto 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #D1FAE5",
                  }}
                >
                  <UsersIcon size={28} />
                </div>
                <h4 style={{ margin: 0, fontSize: "1.1rem", color: "var(--color-primary)" }}>
                  {dev.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          11. BOTTOM BANNER
          ======================================================== */}
      <div className="ref-cta-banner-wrap">
        <div className="ref-cta-banner">
          <LeafCorner className="ref-banner-leaf leaf-left" />

          <div className="ref-cta-left">
            <h2 className="ref-cta-heading">
              Your Health Journey
              <br />
              <span className="ref-journey-wrapper">
                Starts Here
                <svg className="banner-title-arc" viewBox="0 0 100 14" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 10C35 2 65 2 96 10" stroke="#48A682" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
          </div>

          <div className="ref-cta-center">
            <p>
              Join Health &amp; Cure today to access trusted healthcare professionals, manage digital medical records, and experience seamless care.
            </p>
          </div>

          <div className="ref-cta-right">
            <Link to="/register" className="ref-btn-primary ref-cta-btn-nowrap">
              Get Started →
            </Link>
            <div className="banner-heart-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#5E8F7C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          <LeafCorner className="ref-banner-leaf leaf-right" />
        </div>
      </div>
    </div>
  );
}
