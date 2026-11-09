import {
  AccessIcon,
  AuditIcon,
  CalendarIcon,
  ClockIcon,
  CloudUploadIcon,
  CosmeticIcon,
  DatabaseIcon,
  DentalImplantIcon,
  DoctorIcon,
  DownloadIcon,
  EmergencyCareIcon,
  FileCheckIcon,
  GeneralCareIcon,
  HeartIcon,
  HospitalIcon,
  KeyIcon,
  LockIcon,
  OrthodonticsIcon,
  PediatricIcon,
  PillIcon,
  PrescriptionIcon,
  PulseIcon,
  RecordsIcon,
  RefreshIcon,
  ShieldAlertIcon,
  ShieldIcon,
  SmileIcon,
  StarIcon,
  StethoscopeIcon,
  TimelineIcon,
  UserCheckIcon,
  UsersIcon,
} from "../components/icons/icons";

export const services = [
  {
    id: "general-care",
    title: "General Healthcare",
    text: "Preventive care, routine checkups & comprehensive primary health evaluations.",
    longDesc: "Our general healthcare services form the foundation of lifelong wellness. From annual physical exams to early health screening and lifestyle guidance, our practitioners ensure you stay ahead of any medical concerns with unified record tracking.",
    Icon: GeneralCareIcon,
    badge: "Primary Care",
    features: [
      "Comprehensive annual health screenings",
      "Preventive vaccinations & health tracking",
      "Chronic illness management & lifestyle care",
      "Immediate digital health documentation",
    ],
  },
  {
    id: "doctor-consult",
    title: "Specialist Care",
    text: "Connect directly with verified specialists across all key medical disciplines.",
    longDesc: "When your care requires specialised expertise, Health & Cure connects you with licensed cardiologists, neurologists, orthopedists, and endocrinologists. Specialists receive full contextual histories before your consultation begins.",
    Icon: OrthodonticsIcon,
    badge: "Specialists",
    features: [
      "Board-certified physician network",
      "Pre-consultation record sharing with patient consent",
      "Interactive in-clinic and video consultations",
      "Direct follow-up scheduling & clinical notes",
    ],
  },
  {
    id: "prescriptions",
    title: "Prescription Care",
    text: "Digital prescriptions, dosage schedules & pharmacy medicine tracking.",
    longDesc: "Say goodbye to illegible handwritten scripts. All prescriptions issued by Health & Cure physicians are structured digitally, detailing brand names, generics, dosage instructions, and refill milestones in your patient portal.",
    Icon: DentalImplantIcon,
    badge: "Pharmacy",
    features: [
      "Structured electronic prescriptions",
      "Dosage reminders & refill calendar alerts",
      "Drug interaction cross-checking",
      "Direct exportable pharmacy PDFs",
    ],
  },
  {
    id: "records",
    title: "Diagnostic Records",
    text: "Laboratory tests, imaging reports & unified medical timelines in one place.",
    longDesc: "Eliminate duplicate blood draws and lost scans. Health & Cure stores pathology reports, radiology imaging, and diagnostic summaries chronologically, attached permanently to your verified health identity.",
    Icon: CosmeticIcon,
    badge: "Diagnostics",
    features: [
      "Pathology, bloodwork & imaging storage",
      "Chronological medical event timeline",
      "Standardised clinical lab metric graphs",
      "Encrypted patient-owned document vault",
    ],
  },
  {
    id: "family-pediatric",
    title: "Pediatric & Family",
    text: "Gentle, dedicated healthcare for growing infants, children & multi-generation families.",
    longDesc: "Family healthcare tailored for every generation. Parents can seamlessly oversee dependent child vaccination charts, developmental milestones, and pediatric consults through their central Health & Cure account.",
    Icon: PediatricIcon,
    badge: "Family",
    features: [
      "Infant & child developmental checkups",
      "Immunisation records & milestone tracking",
      "Parental consent & dependent management",
      "Senior wellness & geriatric care coordination",
    ],
  },
  {
    id: "emergency-access",
    title: "Emergency Care",
    text: "Rapid medical coordination, critical allergy info & 24/7 care connectivity.",
    longDesc: "In critical moments, quick access to your blood type, chronic conditions, and drug allergies saves lives. Health & Cure provides an emergency summary accessible during acute medical situations under strict audit controls.",
    Icon: EmergencyCareIcon,
    badge: "24/7 Care",
    features: [
      "Instant critical health summary (allergies & blood type)",
      "Emergency contact notification alerts",
      "Rapid triage & hospital coordination",
      "Post-emergency continuity of care",
    ],
  },
];

export const statistics = [
  {
    value: "5,000+",
    label: "Happy Patients",
    Icon: SmileIcon,
  },
  {
    value: "4.9/5",
    label: "Average Rating",
    Icon: StarIcon,
  },
  {
    value: "10+ Years",
    label: "Of Trusted Care",
    Icon: UsersIcon,
  },
  {
    value: "Healthy Lives",
    label: "Brighter Futures",
    Icon: HeartIcon,
  },
];

export const trustBadges = [
  {
    title: "Trusted Care",
    desc: "Verified practitioners",
    Icon: ShieldIcon,
  },
  {
    title: "All Ages Welcome",
    desc: "From pediatric to senior care",
    Icon: UsersIcon,
  },
  {
    title: "Modern Technology",
    desc: "Digital records & consent",
    Icon: GeneralCareIcon,
  },
];

export const principles = [
  {
    quote:
      "The team at Health & Cure made my visit so easy and comfortable. Having all my records and prescriptions connected in one place gives me total peace of mind!",
    byline: "Jessica R.",
    role: "Patient since 2023",
  },
  {
    quote:
      "Having full patient consent and verified medical histories before a consultation has completely transformed our clinical workflow.",
    byline: "Dr. Marcus Vance",
    role: "Cardiologist & Specialist",
  },
  {
    quote:
      "No more misplaced paper files or repeated tests. Everything is organized, private, and available with one tap whenever my family needs it.",
    byline: "Eleanor Hayes",
    role: "Family Care Patient",
  },
];

export const workflowSteps = [
  {
    number: "01",
    title: "Create the Right Account",
    summary: "Patients and doctors register through distinct, tailored onboarding paths.",
    detail: "Patients register immediately to secure their health record vault. Doctors must submit medical licensing and qualifications, which undergo mandatory manual verification by the platform Superadmin before clinical privileges are activated. Public registration can never create a superadmin account.",
    Icon: UserCheckIcon,
    badge: "Role Separation",
  },
  {
    number: "02",
    title: "Keep the Medical History Together",
    summary: "Prescriptions, diagnostic reports, and visit notes stay attached to one patient.",
    detail: "All healthcare interactions reside in a unified, chronological timeline. Whether you visit a general physician, an orthopedist, or a diagnostic lab, every record belongs to your permanent health identity rather than being scattered across disconnected clinics.",
    Icon: RecordsIcon,
    badge: "Unified Record",
  },
  {
    number: "03",
    title: "Share Access on Purpose",
    summary: "Access is explicit, never automatic. Searching for a patient unlocks nothing.",
    detail: "We adhere strictly to privacy-by-design. A doctor searching the platform for a patient cannot browse or view their documents without explicit consent. Your medical history remains completely sealed until a formal access handshake is completed.",
    Icon: LockIcon,
    badge: "Zero-Trust Privacy",
  },
  {
    number: "04",
    title: "Doctor Requests Access",
    summary: "Physicians initiate a formal request with clinical justification and timeframe.",
    detail: "Prior to a consultation, the attending doctor submits an electronic Access Request stating the exact clinical reason (e.g., 'Pre-consultation cardiac evaluation') and the required duration (e.g., 24 hours, 7 days).",
    Icon: KeyIcon,
    badge: "Justified Need",
  },
  {
    number: "05",
    title: "Patient Approves or Rejects",
    summary: "Patients hold complete authority to grant, decline, or inspect all requests.",
    detail: "You receive an instant notification in your Patient Portal showing the doctor's credentials, requested timeframe, and reason. With a single tap, you can approve or reject the request. No backend process can override your decision.",
    Icon: FileCheckIcon,
    badge: "Patient Autonomy",
  },
  {
    number: "06",
    title: "Access Can Be Revoked or Expire",
    summary: "Time-limited permissions expire automatically or can be immediately revoked.",
    detail: "Once the approved duration elapses, the doctor's access key is cryptographically expired. Furthermore, you may click 'Revoke Access' at any moment, which immediately cuts off the doctor's ability to view or download any of your clinical files.",
    Icon: RefreshIcon,
    badge: "Revocable Consent",
  },
];

export const securityRules = [
  {
    id: "patient-ownership",
    title: "1. Patient Ownership of Medical Records",
    text: "Patients own 100% of their medical documents, diagnostic results, and clinical histories. The platform serves as a secure custodian, not the data owner.",
    Icon: ShieldIcon,
  },
  {
    id: "consent-requirements",
    title: "2. Patient Consent Requirements",
    text: "Consent is strictly opt-in and granular. No physician, clinical staff, or third party can view health data without explicit, verifiable patient consent.",
    Icon: FileCheckIcon,
  },
  {
    id: "doctor-verification",
    title: "3. Doctor Verification",
    text: "All healthcare providers must present valid medical credentials and active state licenses. Superadmins manually audit every doctor before clinical privileges are granted.",
    Icon: UserCheckIcon,
  },
  {
    id: "access-permissions",
    title: "4. Doctor Access Permissions",
    text: "Searching for a patient on the platform does not reveal any medical records. Doctors must submit a formal request detailing clinical justification.",
    Icon: LockIcon,
  },
  {
    id: "access-expiration",
    title: "5. Access Expiration",
    text: "All approved doctor access is time-bounded. When the approved window expires, all document viewing permissions terminate automatically on the backend.",
    Icon: ClockIcon,
  },
  {
    id: "access-revocation",
    title: "6. Immediate Access Revocation",
    text: "Patients can revoke doctor access at any second with a single click. Revocation takes effect immediately, blocking any subsequent API calls.",
    Icon: RefreshIcon,
  },
  {
    id: "secure-uploads",
    title: "7. Secure Document Uploads",
    text: "All uploaded files undergo strict MIME-type validation, virus scanning, and size boundaries. Documents are encrypted both in transit (TLS 1.3) and at rest.",
    Icon: CloudUploadIcon,
  },
  {
    id: "secure-downloads",
    title: "8. Secure Medical Record Downloads",
    text: "Downloads are served via short-lived, authenticated presigned URLs. Direct unauthenticated file paths are completely disabled.",
    Icon: DownloadIcon,
  },
  {
    id: "auth-protection",
    title: "9. Authentication & Password Protection",
    text: "Authentication uses cryptographically signed JWT tokens (HS256) and industry-standard BCrypt password hashing. Passwords are never stored in plaintext.",
    Icon: KeyIcon,
  },
  {
    id: "audit-logs",
    title: "10. Comprehensive Audit Logs",
    text: "Every record view, upload, access request, approval, and revocation is recorded with an immutable timestamp, user ID, and IP address for forensic compliance.",
    Icon: AuditIcon,
  },
  {
    id: "superadmin-limits",
    title: "11. Superadmin Responsibilities & Boundaries",
    text: "Superadmins manage accounts and verify doctors, but are architecturally barred from viewing private patient medical documents without explicit consent.",
    Icon: ShieldAlertIcon,
  },
  {
    id: "data-privacy",
    title: "12. Data Privacy & Compliance",
    text: "We adhere strictly to international healthcare privacy principles (HIPAA & GDPR equivalence). Your information is never sold, monetized, or shared.",
    Icon: DatabaseIcon,
  },
];

export const aboutPillars = [
  {
    title: "One Connected Medical Record",
    subtitle: "Complete clinical continuity",
    desc: "Prescriptions, laboratory pathology, radiological imaging, and doctor consultations belong to a single, continuous patient record. Doctors see the complete clinical picture instead of fragmented pieces.",
    Icon: RecordsIcon,
  },
  {
    title: "Three Dedicated Portals",
    subtitle: "Purpose-built role separation",
    desc: "Patients, doctors, and superadmins operate in dedicated workspaces powered by the same secure backend. Each role possesses strictly audited permissions and tailored clinical workflows.",
    Icon: UsersIcon,
  },
  {
    title: "Patient-Controlled Consent",
    subtitle: "Zero unapproved viewing",
    desc: "Medical privacy starts with patient empowerment. Doctors cannot open medical files merely by searching a name; every consultation requires an approved, time-limited access handshake.",
    Icon: LockIcon,
  },
];

export const searchIndex = [
  { title: "Home", path: "/", detail: "Landing page & clinic overview" },
  { title: "Services", path: "/services", detail: "General care, prescriptions, diagnostics, and appointments" },
  { title: "General Healthcare", path: "/services#general-care", detail: "Preventive care & exams" },
  { title: "Specialist Care", path: "/services#doctor-consult", detail: "Verified medical specialists" },
  { title: "Prescription Care", path: "/services#prescriptions", detail: "Digital prescriptions & medicine tracking" },
  { title: "Diagnostic Records", path: "/services#records", detail: "Lab reports & medical history" },
  { title: "Pediatric & Family", path: "/services#family-pediatric", detail: "Care for families & children" },
  { title: "Emergency Care", path: "/services#emergency-access", detail: "Immediate medical assistance" },
  { title: "Book Appointment", path: "/book-appointment", detail: "Schedule a consultation with Google Sign-In or manual form" },
  { title: "About", path: "/about", detail: "Modern healthcare & unified architecture" },
  { title: "How It Works", path: "/how-it-works", detail: "Account creation, consent control & records" },
  { title: "Security Rules", path: "/security-rules", detail: "12 security pillars, patient consent & privacy" },
  { title: "Contact", path: "/contact", detail: "Get in touch with clinic coordinators" },
  { title: "Login", path: "/login", detail: "Secure sign-in for Patients, Doctors & Admins" },
  { title: "Get Started", path: "/get-started", detail: "Create a Patient or Doctor account" },
  { title: "Patient Registration", path: "/get-started?role=patient", detail: "Personal patient account" },
  { title: "Doctor Registration", path: "/get-started?role=doctor", detail: "Licensed practitioner account" },
];
