import { CATEGORY_META } from "../utils/constants.js";

export function Badge({ children, color = "#7c3aed", bg, border }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, padding: "3px 10px", borderRadius: 20,
      background: bg || color + "22", color, border: `1px solid ${border || color + "44"}`,
      fontWeight: 700, letterSpacing: "0.07em", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

export function UniqueBadge() {
  return <Badge color="#e879f9" bg="#3b0764" border="#7e22ce">★ UNIQUE</Badge>;
}

export function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: "#0f1117", border: `1px solid ${accent}33`,
      borderRadius: 14, padding: "18px 20px", flex: 1, minWidth: 130,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 10, right: 14, fontSize: 24, opacity: 0.15,
      }}>{icon}</div>
      <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function ScorePill({ score }) {
  const cfg = score >= 75 ? { bg: "#3b0764", color: "#e879f9", border: "#7e22ce", label: "BLOCKED" }
    : score >= 50 ? { bg: "#450a0a", color: "#f87171", border: "#991b1b", label: "HIGH RISK" }
    : score >= 25 ? { bg: "#431407", color: "#fb923c", border: "#9a3412", label: "WATCH" }
    : { bg: "#052e16", color: "#4ade80", border: "#166534", label: "SAFE" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono', monospace",
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>{score} · {cfg.label}</span>
  );
}

export function Avatar({ initials, color, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "33", border: `2px solid ${color}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, fontWeight: 700, color, flexShrink: 0,
      fontFamily: "'Space Mono', monospace",
    }}>{initials}</div>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.01em" }}>{children}</div>
      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function Card({ children, style = {}, accent }) {
  return (
    <div style={{
      background: "#0f1117",
      border: `1px solid ${accent ? accent + "44" : "#1f2937"}`,
      borderRadius: 14, padding: "18px 20px",
      ...style,
    }}>{children}</div>
  );
}

export function CategoryTag({ category }) {
  const meta = CATEGORY_META[category] || {};
  return (
    <span style={{
      display: "inline-block", fontSize: 10, padding: "2px 8px", borderRadius: 6,
      background: (meta.color || "#6b7280") + "22",
      color: meta.color || "#6b7280",
      border: `1px solid ${(meta.color || "#6b7280")}44`,
      textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
    }}>{meta.icon} {meta.label || category}</span>
  );
}

export function GlowButton({ children, onClick, color = "#7c3aed", outline = false, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 22px", borderRadius: 10, cursor: "pointer",
      fontWeight: 700, fontSize: 13, letterSpacing: "0.04em",
      border: outline ? `1px solid ${color}` : "none",
      background: outline ? "transparent" : color,
      color: outline ? color : "#fff",
      transition: "all 0.2s", fontFamily: "'Inter', sans-serif",
      ...style,
    }}>{children}</button>
  );
}

export function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div style={{ width: "100%", height: 6, background: "#1f2937", borderRadius: 3 }}>
        <div style={{
          height: 6, borderRadius: 3,
          width: pct + "%",
          background: pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : color,
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}
