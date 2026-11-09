import { LogoMark } from "../icons/icons";

export default function Brand({ compact = false }) {
  return (
    <span className={`brand ${compact ? "brand-compact" : ""}`}>
      <LogoMark size={compact ? 32 : 40} />
      <span className="brand-text">
        <strong className="brand-name">Health &amp; Cure</strong>
        <span className="brand-tagline">HEALTHCARE PLATFORM</span>
      </span>
    </span>
  );
}
