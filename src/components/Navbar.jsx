export default function Navbar({ active, setPage }) {
  const links = [
    { id: "home",    label: "Home",              icon: "⬡" },
    { id: "wallet",  label: "My Wallet",         icon: "◈" },
    { id: "pay",     label: "Pay & Transfer",    icon: "⚡" },
    { id: "fraud",   label: "AI Fraud Monitor",  icon: "🛡" },
    { id: "admin",   label: "Admin Panel",       icon: "⚙" },
    { id: "chain",   label: "Chain Explorer",    icon: "⛓" },
  ];

  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: 4,
      padding: "10px 20px", background: "#080b14",
      borderBottom: "1px solid #1f2937", flexWrap: "wrap",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginRight: 16, paddingRight: 16, borderRight: "1px solid #1f2937",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>⛓</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#f9fafb", fontFamily: "'Space Mono',monospace", lineHeight: 1 }}>
            Campus<span style={{ color: "#7c3aed" }}>Chain</span>
          </div>
          <div style={{ fontSize: 9, color: "#374151", letterSpacing: "0.06em" }}>AI · POLYGON MUMBAI</div>
        </div>
      </div>

      {/* Links */}
      {links.map(link => (
        <button key={link.id} onClick={() => setPage(link.id)} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 8, cursor: "pointer",
          fontSize: 12, fontWeight: active === link.id ? 700 : 500,
          fontFamily: "'Inter', sans-serif",
          background: active === link.id ? "#1e1b4b" : "transparent",
          border: active === link.id ? "1px solid #4338ca" : "1px solid transparent",
          color: active === link.id ? "#a5b4fc" : "#6b7280",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 13 }}>{link.icon}</span>
          {link.label}
          {link.id === "fraud" && (
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#ef4444",
              animation: "pulse 1.5s infinite",
            }} />
          )}
        </button>
      ))}

      {/* Live indicator */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: 11, color: "#10b981", fontFamily: "'Space Mono',monospace" }}>LIVE</span>
      </div>
    </nav>
  );
}
