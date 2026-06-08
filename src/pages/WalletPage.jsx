import { useState } from "react";
import { MOCK_STUDENTS, RECENT_TXS, CATEGORY_META } from "../utils/constants.js";
import { Avatar, Badge, ScorePill, CategoryTag, GlowButton, ProgressBar, Card, SectionTitle } from "../components/UI.jsx";

const PREDICTIONS = [
  { category: "canteen", daysLeft: 4,  msg: "Reduce daily spend from ₹96 → ₹70 to last the month",  severity: "high"   },
  { category: "hostel",  daysLeft: 14, msg: "Hostel budget on track",                                severity: "good"   },
  { category: "p2p",     daysLeft: 22, msg: "P2P transfers within normal range",                     severity: "good"   },
  { category: "event",   daysLeft: 6,  msg: "3 events upcoming — consider limiting discretionary spend", severity: "medium" },
];

export default function WalletPage() {
  const [selected, setSelected] = useState(0);
  const student = MOCK_STUDENTS[selected];
  const totalSpent = Object.values(student.spends).reduce((a, b) => a + b, 0);
  const totalLimit = 5000;

  return (
    <div style={{ padding: "24px 28px 40px" }}>
      {/* Student selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Select student wallet
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MOCK_STUDENTS.map((s, i) => (
            <button key={s.id} onClick={() => setSelected(i)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              border: selected === i ? `1px solid ${s.color}` : "1px solid #1f2937",
              background: selected === i ? s.color + "22" : "#0f1117",
              fontFamily: "'Inter',sans-serif",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: s.color + "33", border: `1px solid ${s.color}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: s.color,
              }}>{s.avatar}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: selected === i ? s.color : "#9ca3af" }}>
                {s.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Balance card */}
        <div style={{
          background: "linear-gradient(135deg,#0e0b1f,#080c18)",
          border: `1px solid ${student.color}44`,
          borderRadius: 16, padding: "22px 24px",
          position: "relative", overflow: "hidden",
          gridColumn: "span 1",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: student.color, opacity: 0.06, filter: "blur(30px)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <Avatar initials={student.avatar} color={student.color} size={48} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em" }}>Student ID</div>
              <div style={{ fontSize: 12, fontFamily: "'Space Mono',monospace", color: "#9ca3af" }}>{student.id}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{student.name}</div>
          <div style={{ fontSize: 13, color: "#374151", marginBottom: 16 }}>{student.dept} · Year {student.year} · CGPA {student.cgpa}</div>
          <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Available balance</div>
          <div style={{ fontSize: 38, fontWeight: 900, fontFamily: "'Space Mono',monospace", color: student.color, lineHeight: 1 }}>
            {student.balance.toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: "#4b5563", marginTop: 4, marginBottom: 16 }}>CPC &nbsp;·&nbsp; = ₹{student.balance.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: "#374151" }}>{student.address} &nbsp;·&nbsp; Polygon Mumbai</div>

          {/* Monthly used */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Monthly used</span>
              <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'Space Mono',monospace" }}>
                ₹{totalSpent.toLocaleString()} / ₹{totalLimit.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={totalSpent} max={totalLimit} color={student.color} />
          </div>
        </div>

        {/* AI Spend Predictor */}
        <div style={{
          background: "#080c18", border: "1px solid #1e3a5f",
          borderRadius: 16, padding: "20px 22px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🔮</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd" }}>AI Spend Predictor</div>
              <div style={{ fontSize: 10, color: "#374151" }}>XGBoost model · Forecasts budget depletion</div>
            </div>
            <Badge color="#e879f9" bg="#3b0764" border="#7e22ce" style={{ marginLeft: "auto" }}>★ UNIQUE</Badge>
          </div>
          {PREDICTIONS.map(p => {
            const meta = CATEGORY_META[p.category];
            const color = p.severity === "high" ? "#ef4444" : p.severity === "medium" ? "#f59e0b" : "#10b981";
            const bg = p.severity === "high" ? "#1a0a0a" : p.severity === "medium" ? "#1a1200" : "#0a1a0f";
            return (
              <div key={p.category} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: bg, border: `1px solid ${color}22`,
                borderRadius: 10, padding: "10px 12px", marginBottom: 8,
              }}>
                <span style={{ fontSize: 16 }}>{meta.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#e5e7eb" }}>{meta.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'Space Mono',monospace" }}>
                      {p.severity === "good" ? "✓ On track" : `⚠ ${p.daysLeft} days left`}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{p.msg}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Spend Breakdown */}
      <div style={{
        background: "#0f1117", border: "1px solid #1f2937",
        borderRadius: 16, padding: "20px 22px", marginBottom: 24,
      }}>
        <SectionTitle sub="Per-category spend vs limit this month · 1 CPC = ₹1">
          Category spend breakdown
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {Object.entries(student.spends).map(([cat, spent]) => {
            const meta = CATEGORY_META[cat];
            const pct = Math.round((spent / meta.monthly) * 100);
            return (
              <div key={cat} style={{
                background: "#080b14", border: `1px solid ${meta.color}22`,
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{meta.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, fontFamily: "'Space Mono',monospace" }}>
                    {pct}%
                  </span>
                </div>
                <ProgressBar value={spent} max={meta.monthly} color={meta.color} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>₹{spent.toLocaleString()} spent</span>
                  <span style={{ fontSize: 11, color: "#374151" }}>/ ₹{meta.monthly.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 4 }}>Max single: ₹{meta.maxSingle.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ background: "#0f1117", border: "1px solid #1f2937", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1f2937" }}>
          <SectionTitle sub="Last 6 transactions · Click to view on-chain">
            Transaction history
          </SectionTitle>
        </div>
        {RECENT_TXS.map(tx => (
          <div key={tx.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 20px", borderBottom: "1px solid #111827",
            background: tx.status === "blocked" ? "#1a0a2e" : "transparent",
          }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#4b5563", minWidth: 52 }}>#{tx.id}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>
                {tx.from} → {tx.to}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                <CategoryTag category={tx.category} />
                <span style={{ fontSize: 10, color: "#4b5563" }}>{tx.time}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb", fontFamily: "'Space Mono',monospace" }}>
                ₹{tx.amount.toLocaleString()}
              </div>
              <div style={{ marginTop: 4 }}>
                <ScorePill score={tx.score} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
