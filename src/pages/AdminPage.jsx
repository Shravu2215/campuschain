import { useState } from "react";
import { MOCK_STUDENTS, SCHOLARSHIPS, CATEGORY_META } from "../utils/constants.js";
import { Avatar, Badge, GlowButton, ProgressBar, SectionTitle, UniqueBadge } from "../components/UI.jsx";

export default function AdminPage() {
  const [tab, setTab] = useState("overview");
  const [fraudThreshold, setFraudThreshold] = useState(75);
  const [scholarships, setScholarships] = useState(SCHOLARSHIPS);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [mintStudent, setMintStudent] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [mintSuccess, setMintSuccess] = useState(false);

  const totalCPC = students.reduce((a, s) => a + s.balance, 0);

  const tabs = [
    { id: "overview",     label: "📊 Overview"      },
    { id: "users",        label: "👥 Students"       },
    { id: "scholarships", label: "🎓 Scholarships"  },
    { id: "policies",     label: "⚙ Policies"       },
  ];

  const handleMint = () => {
    if (!mintStudent || !mintAmount) return;
    setStudents(prev => prev.map(s =>
      s.name === mintStudent ? { ...s, balance: s.balance + Number(mintAmount) } : s
    ));
    setMintSuccess(true);
    setTimeout(() => setMintSuccess(false), 3000);
    setMintAmount("");
  };

  return (
    <div style={{ padding: "24px 28px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub="Full campus financial control · Smart contract management · Polygon Mumbai">
          Admin Command Center
        </SectionTitle>
        <Badge color="#fb923c" bg="#431407" border="#9a3412">Admin Access · Role: Super Admin</Badge>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 16px", borderRadius: 10, cursor: "pointer",
            border: tab === t.id ? "1px solid #d97706" : "1px solid #1f2937",
            background: tab === t.id ? "#431407" : "#0f1117",
            color: tab === t.id ? "#fbbf24" : "#9ca3af",
            fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
            fontFamily: "'Inter',sans-serif",
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { l: "Registered Students",  v: students.length,                         c: "#3b82f6", icon: "👤" },
              { l: "CPC in Circulation",   v: (totalCPC / 1000).toFixed(1) + "K",      c: "#10b981", icon: "₡" },
              { l: "Blocked Today",        v: 23,                                       c: "#e879f9", icon: "🚫" },
              { l: "Fraud Threshold",      v: fraudThreshold,                           c: "#f59e0b", icon: "🛡" },
              { l: "Active Scholarships",  v: scholarships.filter(s => s.status === "active").length, c: "#a855f7", icon: "🎓" },
              { l: "Total Txns Today",     v: "3,891",                                  c: "#14b8a6", icon: "⚡" },
            ].map(s => (
              <div key={s.l} style={{ background: "#0f1117", border: `1px solid ${s.c}22`, borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 8, right: 12, fontSize: 20, opacity: 0.12 }}>{s.icon}</div>
                <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.l}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.c, fontFamily: "'Space Mono',monospace" }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* AI Threshold control */}
          <div style={{ background: "#080c18", border: "1px solid #7e22ce44", borderRadius: 16, padding: "20px 22px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#e5e7eb" }}>🎛 Live AI Fraud Threshold</span>
                  <UniqueBadge />
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
                  Transactions scoring ≥ this value are auto-blocked by smart contract
                </div>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 32, fontWeight: 900, color: "#e879f9" }}>{fraudThreshold}</div>
            </div>
            <input type="range" min={50} max={95} step={5} value={fraudThreshold}
              onChange={e => setFraudThreshold(Number(e.target.value))}
              style={{ width: "100%", marginBottom: 10 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4b5563" }}>
              <span>50 — Very strict (catch more)</span>
              <span>95 — Very lenient (catch less)</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Exam Season",  val: 65, desc: "Stricter — low activity expected"       },
                { label: "Normal Days",  val: 75, desc: "Default balanced threshold"              },
                { label: "Fest Season",  val: 85, desc: "Lenient — large event payments expected" },
              ].map(p => (
                <button key={p.label} onClick={() => setFraudThreshold(p.val)} style={{
                  padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                  border: fraudThreshold === p.val ? "1px solid #7c3aed" : "1px solid #374151",
                  background: fraudThreshold === p.val ? "#1e1b4b" : "#0f1117",
                  fontFamily: "'Inter',sans-serif",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: fraudThreshold === p.val ? "#a5b4fc" : "#9ca3af" }}>{p.label} ({p.val})</div>
                  <div style={{ fontSize: 10, color: "#4b5563" }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick mint */}
          <div style={{ background: "#0f1117", border: "1px solid #1f2937", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e7eb", marginBottom: 14 }}>⚡ Quick CPC Mint</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select value={mintStudent} onChange={e => setMintStudent(e.target.value)} style={{ flex: 1, minWidth: 160, padding: "9px 12px", borderRadius: 10, background: "#080b14", border: "1px solid #374151", color: "#f9fafb", fontSize: 13 }}>
                <option value="">Select student</option>
                {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.id})</option>)}
              </select>
              <input type="number" value={mintAmount} onChange={e => setMintAmount(e.target.value)} placeholder="Amount CPC" style={{ width: 140, padding: "9px 12px", borderRadius: 10, background: "#080b14", border: "1px solid #374151", color: "#f9fafb", fontSize: 13, fontFamily: "'Space Mono',monospace" }} />
              <GlowButton onClick={handleMint} color="#10b981">Mint CPC</GlowButton>
            </div>
            {mintSuccess && <div style={{ marginTop: 10, fontSize: 12, color: "#4ade80" }}>✅ {mintAmount} CPC minted to {mintStudent} on Polygon Mumbai</div>}
          </div>
        </div>
      )}

      {/* STUDENTS */}
      {tab === "users" && (
        <div>
          <div style={{ background: "#0f1117", border: "1px solid #1f2937", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px", gap: 12, padding: "10px 20px", background: "#080b14", borderBottom: "1px solid #1f2937", fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              <span>Student</span><span>Balance</span><span>CGPA</span><span>Address</span><span>Action</span>
            </div>
            {students.map(s => (
              <div key={s.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                gap: 12, padding: "12px 20px", alignItems: "center",
                borderBottom: "1px solid #111827",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials={s.avatar} color={s.color} size={34} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#4b5563" }}>{s.id} · {s.dept}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#3b82f6", fontWeight: 700 }}>
                  {s.balance.toLocaleString()} CPC
                </div>
                <div style={{ fontSize: 13, color: s.cgpa >= 9 ? "#4ade80" : s.cgpa >= 8 ? "#f59e0b" : "#f87171", fontWeight: 600 }}>
                  {s.cgpa}
                </div>
                <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'Space Mono',monospace" }}>{s.address}</div>
                <GlowButton color="#374151" outline style={{ padding: "4px 10px", fontSize: 11 }}>Block</GlowButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHOLARSHIPS */}
      {tab === "scholarships" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb" }}>Smart Scholarship Engine</span>
            <UniqueBadge />
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 18, background: "#080c18", border: "1px solid #1e3a5f", borderRadius: 10, padding: "10px 14px" }}>
            🤖 Condition-based smart contracts automatically mint CPC when conditions are met. Zero paperwork. Zero delay. Fully on-chain.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
            {scholarships.map(sch => (
              <div key={sch.id} style={{
                background: "#0f1117",
                border: sch.status === "active" ? "1px solid #166534" : "1px solid #374151",
                borderRadius: 14, padding: "18px 20px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb" }}>{sch.name}</div>
                  <Badge
                    color={sch.status === "active" ? "#4ade80" : "#9ca3af"}
                    bg={sch.status === "active" ? "#052e16" : "#1f2937"}
                    border={sch.status === "active" ? "#166534" : "#374151"}
                  >{sch.status.toUpperCase()}</Badge>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Condition</span>
                    <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>{sch.condition}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Reward</span>
                    <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700, fontFamily: "'Space Mono',monospace" }}>{sch.reward.toLocaleString()} CPC = ₹{sch.reward.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Recipients</span>
                    <span style={{ fontSize: 11, color: "#e5e7eb" }}>{sch.recipients} students</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Next run</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{sch.nextRun}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <GlowButton color="#10b981" style={{ flex: 1, padding: "7px 10px", fontSize: 11 }}>▶ Run Now</GlowButton>
                  <GlowButton color={sch.status === "active" ? "#ef4444" : "#10b981"} outline style={{ flex: 1, padding: "7px 10px", fontSize: 11 }}
                    onClick={() => setScholarships(prev => prev.map(s => s.id === sch.id ? { ...s, status: s.status === "active" ? "paused" : "active" } : s))}>
                    {sch.status === "active" ? "Pause" : "Activate"}
                  </GlowButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POLICIES */}
      {tab === "policies" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <div key={key} style={{ background: "#0f1117", border: `1px solid ${meta.color}33`, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                </div>
                {[
                  { label: "Daily limit",   value: meta.daily,     unit: "CPC" },
                  { label: "Monthly cap",   value: meta.monthly,   unit: "CPC" },
                  { label: "Single max",    value: meta.maxSingle, unit: "CPC" },
                ].map(field => (
                  <div key={field.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "8px 10px", background: "#080b14", borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{field.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#e5e7eb", fontFamily: "'Space Mono',monospace" }}>
                        ₹{field.value.toLocaleString()}
                      </span>
                      <GlowButton color="#374151" outline style={{ padding: "2px 8px", fontSize: 10 }}>Edit</GlowButton>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
