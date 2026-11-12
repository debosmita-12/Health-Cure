function Svg({ size = 24, children, title, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      {/* Outer organic pebble/shield shape matching reference image */}
      <path
        d="M18 3.5C26 3.5 32.5 10 32.5 18C32.5 25 26.5 32.5 18 32.5C9.5 32.5 3.5 25 3.5 18C3.5 10 10 3.5 18 3.5Z"
        stroke="#174C40"
        strokeWidth="2.2"
        fill="#EEF8F3"
      />
      {/* Smiling curve */}
      <path
        d="M11 20C13 23.5 15.5 25 18 25C20.5 25 23 23.5 25 20"
        stroke="#174C40"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Playful cross / leaf leaf bud in mint */}
      <path
        d="M18 9C18.6 11.2 17.8 12.6 15.8 13.2C17.8 13.4 19.2 14.4 19.6 16.4C20.1 14.4 21.4 13.3 23.5 13C21.6 12.3 20.8 11 21.1 9C21.1 9 20.2 10.6 18 9Z"
        fill="#5E8F7C"
      />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16 }) {
  return (
    <Svg size={size}>
      <path d="M4 12h15" {...stroke} />
      <path d="M13.5 6.5 19 12l-5.5 5.5" {...stroke} />
    </Svg>
  );
}

export function SearchIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <circle cx="11" cy="11" r="6.25" {...stroke} />
      <path d="M15.8 15.8 20 20" {...stroke} />
    </Svg>
  );
}

export function ShieldIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M12 3.4 19.2 6.2v5.4c0 4.3-2.9 7.2-7.2 9-4.3-1.8-7.2-4.7-7.2-9V6.2L12 3.4Z" {...stroke} />
      <path d="m8.8 12.1 2.2 2.2 4.3-4.5" {...stroke} />
    </Svg>
  );
}

export function UsersIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <circle cx="9" cy="9" r="2.6" {...stroke} />
      <circle cx="16" cy="9.4" r="2.2" {...stroke} />
      <path d="M4.6 17.6c.7-2.3 2.4-3.5 4.4-3.5s3.7 1.2 4.4 3.5" {...stroke} />
      <path d="M13.2 14.2c1.5-.3 3 .4 3.8 2.2" {...stroke} />
    </Svg>
  );
}

export function PulseIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M3 12h4.2l1.8-4.2 3.2 8.4 2-4.2H21" {...stroke} />
    </Svg>
  );
}

export function RecordsIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M7 3.8h7.2L19 8.6V20.2H7V3.8Z" {...stroke} />
      <path d="M14 3.8V8.8h5" {...stroke} />
      <path d="M9.5 12.4h6.2M9.5 15.6h4.4" {...stroke} />
    </Svg>
  );
}

export function PrescriptionIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M8 3.8h8.2v16.4H8V3.8Z" {...stroke} />
      <path d="M10.4 8.2h3.2M12 6.6v3.2" {...stroke} />
      <path d="M10.2 13.2h3.6M10.2 16h3.6" {...stroke} />
    </Svg>
  );
}

export function DoctorIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="8" r="2.7" {...stroke} />
      <path d="M6.2 19.2c.8-3 2.8-4.5 5.8-4.5s5 1.5 5.8 4.5" {...stroke} />
      <path d="M17.2 8.2h2.4v2.4h-2.4M18.4 7.2v4.4" {...stroke} />
    </Svg>
  );
}

export function TimelineIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M8 5.2v14" {...stroke} />
      <circle cx="8" cy="7" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="12.2" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17.4" r="1.5" fill="currentColor" stroke="none" />
      <path d="M11.2 7H18M11.2 12.2H16.4M11.2 17.4H18" {...stroke} />
    </Svg>
  );
}

export function CalendarIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <rect x="4" y="5.2" width="16" height="14.2" rx="2.2" {...stroke} />
      <path d="M4 9.4h16M8 3.6v3.2M16 3.6v3.2" {...stroke} />
    </Svg>
  );
}

export function LockIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <rect x="5.5" y="10.2" width="13" height="9" rx="2" {...stroke} />
      <path d="M8.2 10.2V8.1a3.8 3.8 0 0 1 7.6 0v2.1" {...stroke} />
    </Svg>
  );
}

export function MenuIcon({ size = 22 }) {
  return (
    <Svg size={size}>
      <path d="M4 7h16M4 12h16M4 17h16" {...stroke} />
    </Svg>
  );
}

export function CloseIcon({ size = 22 }) {
  return (
    <Svg size={size}>
      <path d="M6 6l12 12M18 6 6 18" {...stroke} />
    </Svg>
  );
}

export function QuoteIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M8.5 19.5C6 19 4.5 17 4.5 14C4.5 10.5 7.5 7 11.5 6L12.5 8C9.5 9 7.5 10.5 7.5 12.5C8 12.4 8.6 12.4 9.2 12.4C11.5 12.4 13.5 14 13.5 16.5C13.5 19 11.5 20.5 8.5 19.5ZM21.5 19.5C19 19 17.5 17 17.5 14C17.5 10.5 20.5 7 24.5 6L25.5 8C22.5 9 20.5 10.5 20.5 12.5C21 12.4 21.6 12.4 22.2 12.4C24.5 12.4 26.5 14 26.5 16.5C26.5 19 24.5 20.5 21.5 19.5Z"
        fill="#174C40"
      />
    </svg>
  );
}

export function AccessIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <circle cx="10" cy="9" r="2.5" {...stroke} />
      <path d="M5.2 17.8c.6-2.4 2.3-3.6 4.8-3.6 1.2 0 2.2.3 3 .9" {...stroke} />
      <rect x="13.2" y="12.2" width="6.4" height="5.2" rx="1.2" {...stroke} />
      <path d="M14.8 12.2v-1.2a1.6 1.6 0 0 1 3.2 0v1.2" {...stroke} />
    </Svg>
  );
}

export function ChevronIcon({ size = 16, direction = "left" }) {
  const d = direction === "right" ? "m9 6 5 6-5 6" : "m15 6-5 6 5 6";
  return (
    <Svg size={size}>
      <path d={d} {...stroke} />
    </Svg>
  );
}

export function PlayIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <polygon points="5,3 13,8 5,13" />
    </svg>
  );
}

export function SmileIcon({ size = 28 }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <path d="M8 14.5C9.5 16.5 14.5 16.5 16 14.5" {...stroke} />
    </Svg>
  );
}

export function StarIcon({ size = 28 }) {
  return (
    <Svg size={size}>
      <path
        d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2-4.5-4.4 6.2-.9L12 3z"
        {...stroke}
      />
    </Svg>
  );
}

export function HeartIcon({ size = 28 }) {
  return (
    <Svg size={size}>
      <path
        d="M12 20.5S4 14.8 4 9.5A5.5 5.5 0 0 1 12 5.2 5.5 5.5 0 0 1 20 9.5c0 5.3-8 11-8 11z"
        {...stroke}
      />
    </Svg>
  );
}

export function GeneralCareIcon({ size = 28 }) {
  // Tooth/preventive outline matching Card 1 in reference
  return (
    <Svg size={size}>
      <path
        d="M12 4.2C8.5 4.2 6.5 6.5 6.5 9.5C6.5 13 8 16 8.8 19.2C9.2 20.6 10.2 20.6 11 18.2C11.5 16.5 12.5 16.5 13 18.2C13.8 20.6 14.8 20.6 15.2 19.2C16 16 17.5 13 17.5 9.5C17.5 6.5 15.5 4.2 12 4.2Z"
        {...stroke}
      />
    </Svg>
  );
}

export function OrthodonticsIcon({ size = 28 }) {
  // Braces / orthodontics wire icon matching Card 2 in reference
  return (
    <Svg size={size}>
      <rect x="7" y="9" width="4" height="6" rx="1" {...stroke} />
      <rect x="13" y="9" width="4" height="6" rx="1" {...stroke} />
      <path d="M4 12H20" {...stroke} />
      <path d="M6 7C6 7 8 5 12 5C16 5 18 7 18 7" {...stroke} />
      <path d="M6 17C6 17 8 19 12 19C16 19 18 17 18 17" {...stroke} />
    </Svg>
  );
}

export function DentalImplantIcon({ size = 28 }) {
  // Screw/implant or root icon matching Card 3 in reference
  return (
    <Svg size={size}>
      <path d="M8 5H16V9C16 11 14 12 12 12C10 12 8 11 8 9V5Z" {...stroke} />
      <path d="M10 12V20M14 12V20" {...stroke} />
      <path d="M8.5 14H15.5M9 16.5H15M9.5 19H14.5" {...stroke} />
    </Svg>
  );
}

export function CosmeticIcon({ size = 28 }) {
  // Sparkle / shining tooth icon matching Card 4 in reference
  return (
    <Svg size={size}>
      <path
        d="M12 4.5C9 4.5 7.5 6.5 7.5 9.2C7.5 12.5 9 15 9.8 18C10.2 19.2 11 19.2 11.5 17.5C11.8 16.2 12.2 16.2 12.5 17.5C13 19.2 13.8 19.2 14.2 18C15 15 16.5 12.5 16.5 9.2C16.5 6.5 15 4.5 12 4.5Z"
        {...stroke}
      />
      {/* Sparkle star on top right */}
      <path d="M18.5 3L19.2 4.8L21 5.5L19.2 6.2L18.5 8L17.8 6.2L16 5.5L17.8 4.8L18.5 3Z" fill="#5E8F7C" />
    </Svg>
  );
}

export function PediatricIcon({ size = 28 }) {
  // Pediatric cute tooth / child icon matching Card 5 in reference
  return (
    <Svg size={size}>
      <path
        d="M12 5.5C9 5.5 7.5 7.2 7.5 9.8C7.5 13 9 15.5 9.8 18C10.2 19.2 11 19.2 11.5 17.5C11.8 16.2 12.2 16.2 12.5 17.5C13 19.2 13.8 19.2 14.2 18C15 15 16.5 13 16.5 9.8C16.5 7.2 15 5.5 12 5.5Z"
        {...stroke}
      />
      <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M10.5 12.5C11 13.3 13 13.3 13.5 12.5" {...stroke} />
    </Svg>
  );
}

export function EmergencyCareIcon({ size = 28 }) {
  // Shield with cross / emergency icon matching Card 6 in reference
  return (
    <Svg size={size}>
      <path d="M12 3.4 19.2 6.2v5.4c0 4.3-2.9 7.2-7.2 9-4.3-1.8-7.2-4.7-7.2-9V6.2L12 3.4Z" {...stroke} />
      <path d="M12 9V15M9 12H15" {...stroke} />
    </Svg>
  );
}

export function CheckIcon({ size = 18 }) {
  return (
    <Svg size={size}>
      <path d="M4 12l5 5L20 6" {...stroke} />
    </Svg>
  );
}

export function SocialInstagramIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" {...stroke} />
      <circle cx="12" cy="12" r="3.5" {...stroke} />
      <circle cx="16.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function SocialFacebookIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <path d="M18 3h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V8a1 1 0 0 1 1-1h3z" {...stroke} />
    </Svg>
  );
}

export function SocialLinkedinIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <rect x="4" y="4" width="16" height="16" rx="3" {...stroke} />
      <path d="M8 11v5M8 8v.01M12 16v-3a2 2 0 0 1 4 0v3M12 11v5" {...stroke} />
    </Svg>
  );
}

export function SocialYoutubeIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <rect x="3" y="6" width="18" height="12" rx="3.5" {...stroke} />
      <polygon points="10,9 15,12 10,15" fill="currentColor" />
    </Svg>
  );
}

export function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function EyeIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" {...stroke} />
      <circle cx="12" cy="12" r="3" {...stroke} />
    </Svg>
  );
}

export function EyeOffIcon({ size = 20 }) {
  return (
    <Svg size={size}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" {...stroke} />
    </Svg>
  );
}

export function KeyIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <circle cx="8" cy="15" r="4" {...stroke} />
      <path d="m10.85 12.15 7.65-7.65M15.5 4.5l2 2M18.5 7.5l2 2" {...stroke} />
    </Svg>
  );
}

export function FileCheckIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" {...stroke} />
      <polyline points="14 2 14 8 20 8" {...stroke} />
      <path d="m9 15 2 2 4-4" {...stroke} />
    </Svg>
  );
}

export function ShieldAlertIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...stroke} />
      <line x1="12" y1="8" x2="12" y2="12" {...stroke} />
      <line x1="12" y1="16" x2="12.01" y2="16" {...stroke} />
    </Svg>
  );
}

export function ClockIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" {...stroke} />
      <polyline points="12 6 12 12 16 14" {...stroke} />
    </Svg>
  );
}

export function RefreshIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M21.5 2v6h-6M2.5 22v-6h6" {...stroke} />
      <path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.3" {...stroke} />
    </Svg>
  );
}

export function UserCheckIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...stroke} />
      <circle cx="9" cy="7" r="4" {...stroke} />
      <polyline points="16 11 18 13 22 9" {...stroke} />
    </Svg>
  );
}

export function CloudUploadIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" {...stroke} />
      <path d="M12 12v9M8 16l4-4 4 4" {...stroke} />
    </Svg>
  );
}

export function DownloadIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...stroke} />
      <polyline points="7 10 12 15 17 10" {...stroke} />
      <line x1="12" y1="15" x2="12" y2="3" {...stroke} />
    </Svg>
  );
}

export function AuditIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...stroke} />
      <polyline points="14 2 14 8 20 8" {...stroke} />
      <line x1="16" y1="13" x2="8" y2="13" {...stroke} />
      <line x1="16" y1="17" x2="8" y2="17" {...stroke} />
      <polyline points="10 9 9 9 8 9" {...stroke} />
    </Svg>
  );
}

export function DatabaseIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <ellipse cx="12" cy="5" rx="9" ry="3" {...stroke} />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" {...stroke} />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" {...stroke} />
    </Svg>
  );
}

export function StethoscopeIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M4.5 3v5a5.5 5.5 0 0 0 11 0V3M8 3v4a2 2 0 0 0 4 0V3" {...stroke} />
      <path d="M10 13.5v2a4 4 0 0 0 4 4h2a2 2 0 0 0 2-2v-1.5" {...stroke} />
      <circle cx="18" cy="14" r="2" {...stroke} />
    </Svg>
  );
}

export function HospitalIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" {...stroke} />
      <path d="M9 10h6M12 7v6M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" {...stroke} />
    </Svg>
  );
}

export function PillIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" {...stroke} />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" {...stroke} />
    </Svg>
  );
}

export function AmbulanceIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" {...stroke} />
      <path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14" {...stroke} />
      <circle cx="7" cy="18" r="2" {...stroke} />
      <circle cx="17" cy="18" r="2" {...stroke} />
      <path d="M7 8h4M9 6v4" {...stroke} />
    </Svg>
  );
}

export function CodeIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <polyline points="16 18 22 12 16 6" {...stroke} />
      <polyline points="8 6 2 12 8 18" {...stroke} />
    </Svg>
  );
}

export function LightningIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" {...stroke} />
    </Svg>
  );
}

export function SupportIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" {...stroke} />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" {...stroke} />
    </Svg>
  );
}

export function LeafIcon({ size = 24 }) {
  return (
    <Svg size={size}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.2a7 7 0 0 1-9 8.8Z" {...stroke} />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" {...stroke} />
    </Svg>
  );
}
