import { CATEGORY_META } from "../utils/constants.js";
import { Badge, UniqueBadge, GlowButton } from "../components/UI.jsx";

const FEATURES = [
  {
    icon: "🤖", title: "AI Fraud Detection", unique: true, color: "#7c3aed",
    desc: "Every transaction scanned by Isolation Forest AI in real-time. 7 signals. Auto-blocked on-chain if score ≥ 75.",
    stat: "98.7% accuracy",
  },
  {
    icon: "⚡", title: "QR Smart Pay", unique: true, color: "#3b82f6",
    desc: "Scan vendor QR → AI pre-screens → Smart contract executes in 2 seconds. Risk check BEFORE payment.",
    stat: "< 2s per payment",
  },
  {
    icon: "🔮", title: "Spend Predictor", unique: true, color: "#f59e0b",
    desc: "XGBoost model predicts if you'll run out of CPC before month-end. Alerts 3 days early per category.",
    stat: "3-day early warning",
  },
  {
    icon: "🎓", title: "Smart Scholarships", unique: true, color: "#10b981",
    desc: "CGPA ≥ 9.0 → auto-mint 2000 CPC. No forms, no delays. Smart contract runs every semester automatically.",
    stat: "Zero paperwork",
  },
  {
    icon: "🔗", title: "Immutable Ledger", unique: false, color: "#14b8a6",
    desc: "Every transaction on Polygon Mumbai blockchain. Tamper-proof, timestamped, publicly auditable forever.",
    stat: "Polygon Mumbai",
  },
  {
    icon: "🛡", title: "AI Decision Audit", unique: true, color: "#e879f9",
    desc: "Every fraud block stored on-chain with AI score + reason. Tamper-proof audit trail. No disputes possible.",
    stat: "100% transparent",
  },
];

const CAMPUS_ECONOMY = Object.entries(CATEGORY_META).map(([key, v]) => ({
  key, ...v,
  flagAt: `> ₹${Math.round(v.maxSingle * 0.6)}`,
}));

export default function HomePage({ setPage }) {
  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0a0620 0%, #060810 40%, #050d18 100%)",
        borderBottom: "1px solid #1f2937",
        padding: "48px 28px 40px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Glowing orbs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "#7c3aed", opacity: 0.06, filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -40, left: 100, width: 200, height: 200, borderRadius: "50%", background: "#3b82f6", opacity: 0.07, filter: "blur(50px)" }} />

        <div style={{ position: "relative", maxWidth: 760 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <Badge color="#a5b4fc" bg="#1e1b4b" border="#4338ca">⛓ Polygon Mumbai Testnet</Badge>
            <Badge color="#4ade80" bg="#052e16" border="#166534">● Live AI Scanning</Badge>
            <Badge color="#fb923c" bg="#431407" border="#9a3412">1 CPC = ₹1</Badge>
          </div>
          <h1 style={{
            fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em",
            color: "#f9fafb", lineHeight: 1.1, marginBottom: 14,
          }}>
            CampusChain <span style={{
              background: "linear-gradient(90deg,#7c3aed,#3b82f6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>AI</span>
            <br />
            <span style={{ fontSize: 28, fontWeight: 700, color: "#6b7280" }}>
              The Intelligent Campus Financial OS
            </span>
          </h1>
          <p style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.7, marginBottom: 24, maxWidth: 560 }}>
            Blockchain-secured campus payments with real-time AI fraud detection.
            Every transaction scanned. Every rupee protected. Zero manual intervention.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <GlowButton onClick={() => setPage("fraud")} color="#7c3aed">
              🛡 Live Fraud Monitor
            </GlowButton>
            <GlowButton onClick={() => setPage("pay")} color="#3b82f6">
              ⚡ Pay Now
            </GlowButton>
            <GlowButton onClick={() => setPage("chain")} color="#14b8a6" outline>
              ⛓ Explorer
            </GlowButton>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 28px 0" }}>
        {/* Live stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Students Onboarded",  value: "1,247",  sub: "across 6 depts",    accent: "#3b82f6",  icon: "👤" },
            { label: "Transactions Today",  value: "3,891",  sub: "₹3.89L processed",  accent: "#10b981",  icon: "⚡" },
            { label: "Fraud Blocked",        value: "23",     sub: "₹91,400 saved",     accent: "#e879f9",  icon: "🛡" },
            { label: "CPC in Circulation",  value: "62.4L",  sub: "= ₹62.4 lakh",      accent: "#f59e0b",  icon: "₡" },
            { label: "AI Scan Speed",        value: "0.4s",   sub: "avg per transaction",accent: "#a855f7", icon: "🤖" },
            { label: "Blockchain Uptime",   value: "99.9%",  sub: "Polygon Mumbai",     accent: "#14b8a6",  icon: "🔗" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#0f1117", border: `1px solid ${s.accent}22`,
              borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 10, right: 14, fontSize: 22, opacity: 0.12 }}>{s.icon}</div>
              <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.accent, fontFamily: "'Space Mono',monospace" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#374151", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* CampusCoin Economy */}
        <div style={{
          background: "#080c18", border: "1px solid #1e3a5f",
          borderRadius: 16, padding: "20px 22px", marginBottom: 28,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "'Space Mono',monospace",
              }}>₡</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#93c5fd" }}>CampusCoin (CPC) Economy</div>
                <div style={{ fontSize: 12, color: "#374151" }}>1 CPC = ₹1 · Fixed peg · Admin-controlled supply · ERC-20 on Polygon</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { l: "Monthly Allotment", v: "5,000 CPC", s: "= ₹5,000 per student" },
                { l: "Daily Cap",         v: "500 CPC",   s: "= ₹500 per day max"   },
                { l: "Global Daily Cap",  v: "₹500",      s: "Smart contract enforced" },
              ].map(i => (
                <div key={i.l} style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em" }}>{i.l}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#3b82f6", fontFamily: "'Space Mono',monospace" }}>{i.v}</div>
                  <div style={{ fontSize: 10, color: "#374151" }}>{i.s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category grid */}
          <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Per-category limits &amp; AI flag thresholds
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            {CAMPUS_ECONOMY.map(cat => (
              <div key={cat.key} style={{
                background: cat.color + "0d", border: `1px solid ${cat.color}33`,
                borderRadius: 12, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: cat.color, marginBottom: 8 }}>{cat.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    ["Avg spend",    `₹${cat.avg}`              ],
                    ["Single max",   `₹${cat.maxSingle.toLocaleString()}`],
                    ["Monthly cap",  `₹${cat.monthly.toLocaleString()}`  ],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "#6b7280" }}>{k}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#e5e7eb", fontFamily: "'Space Mono',monospace" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 8, fontSize: 9, padding: "3px 8px", borderRadius: 6,
                  background: "#450a0a", color: "#f87171", border: "1px solid #991b1b44",
                  letterSpacing: "0.04em",
                }}>🚨 FLAG {cat.flagAt}</div>
                <div style={{ fontSize: 9, color: "#4b5563", marginTop: 6 }}>{cat.examples}</div>
              </div>
            ))}
          </div>

          {/* Score legend */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#4b5563", marginRight: 4 }}>AI FRAUD SCORE:</span>
            {[
              { r: "0–24",   l: "SAFE",      bg: "#052e16", c: "#4ade80", b: "#166534" },
              { r: "25–49",  l: "WATCH",     bg: "#431407", c: "#fb923c", b: "#9a3412" },
              { r: "50–74",  l: "HIGH RISK", bg: "#450a0a", c: "#f87171", b: "#991b1b" },
              { r: "75–100", l: "BLOCKED",   bg: "#3b0764", c: "#e879f9", b: "#7e22ce" },
            ].map(s => (
              <div key={s.l} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: s.bg, border: `1px solid ${s.b}`,
                borderRadius: 8, padding: "5px 12px",
              }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: s.c }}>{s.r}</span>
                <span style={{ fontSize: 10, color: s.c, opacity: 0.8 }}>{s.l}</span>
              </div>
            ))}
            <span style={{ fontSize: 11, color: "#374151", marginLeft: 4 }}>
              Score ≥ 75 → Smart contract auto-reverses on-chain instantly
            </span>
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
            What makes CampusChain different
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: "#0f1117",
                border: f.unique ? `1px solid ${f.color}44` : "1px solid #1f2937",
                borderRadius: 14, padding: "18px 20px",
                position: "relative", overflow: "hidden",
              }}>
                {f.unique && <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${f.color}, transparent)`,
                }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 28 }}>{f.icon}</div>
                  {f.unique && <UniqueBadge />}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb", marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 10 }}>{f.desc}</div>
                <div style={{
                  display: "inline-block", fontSize: 11, padding: "4px 10px", borderRadius: 8,
                  background: f.color + "22", color: f.color, border: `1px solid ${f.color}44`,
                  fontWeight: 600,
                }}>{f.stat}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{
          background: "#0f1117", border: "1px solid #1f2937",
          borderRadius: 16, padding: "20px 22px",
        }}>
          <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
            How a transaction works
          </div>
          <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
            {[
              { n: 1, icon: "👤", t: "Student initiates",  d: "Opens app, enters amount + category + recipient", c: "#3b82f6" },
              { n: 2, icon: "🤖", t: "AI scans (0.4s)",    d: "7-signal Isolation Forest model scores 0–100",    c: "#7c3aed" },
              { n: 3, icon: "⛓", t: "Smart contract",     d: "Score < 75: execute. Score ≥ 75: auto-block",     c: "#f59e0b" },
              { n: 4, icon: "✅", t: "Transaction done",   d: "On-chain record written with AI score + hash",    c: "#10b981" },
            ].map((step, i) => (
              <div key={step.n} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 160 }}>
                <div style={{
                  flex: 1, background: "#080b14", border: `1px solid ${step.c}33`,
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{step.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: step.c, marginBottom: 4 }}>{step.t}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{step.d}</div>
                </div>
                {i < 3 && (
                  <div style={{ padding: "0 8px", color: "#374151", fontSize: 18, flexShrink: 0 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
