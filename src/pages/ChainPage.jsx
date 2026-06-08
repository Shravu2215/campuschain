import { useState } from "react";
import { CHAIN_TXS, CATEGORY_META } from "../utils/constants.js";
import { Badge, ScorePill, CategoryTag, SectionTitle, UniqueBadge } from "../components/UI.jsx";

const BLOCKS = [
  { number: "41824009", txs: 3, time: "2 min ago",  gas: "63,000",  validator: "0xVal1...abc" },
  { number: "41824005", txs: 1, time: "6 min ago",  gas: "32,100",  validator: "0xVal2...def" },
  { number: "41824001", txs: 2, time: "10 min ago", gas: "42,000",  validator: "0xVal3...ghi" },
  { number: "41823998", txs: 1, time: "14 min ago", gas: "21,000",  validator: "0xVal1...abc" },
  { number: "41823994", txs: 1, time: "17 min ago", gas: "45,230",  validator: "0xVal4...jkl" },
];

export default function ChainPage() {
  const [view, setView] = useState("txns");
  const [search, setSearch] = useState("");
  const [inspecting, setInspecting] = useState(null);

  const filtered = CHAIN_TXS.filter(tx =>
    search === "" ||
    tx.hash.includes(search) ||
    tx.from.includes(search) ||
    tx.to.includes(search) ||
    tx.status.includes(search)
  );

  const statusConfig = {
    confirmed: { bg: "#052e16", color: "#4ade80", border: "#166534", label: "CONFIRMED" },
    reversed:  { bg: "#3b0764", color: "#e879f9", border: "#7e22ce", label: "REVERSED"  },
    flagged:   { bg: "#450a0a", color: "#f87171", border: "#991b1b", label: "FLAGGED"   },
  };

  return (
    <div style={{ padding: "24px 28px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub="Every CampusChain transaction · Polygon Mumbai · Chain ID 80001 · Publicly verifiable">
          Blockchain Explorer
        </SectionTitle>
        <div style={{ display: "flex", gap: 8 }}>
          <Badge color="#4ade80" bg="#052e16" border="#166534">● Chain Synced</Badge>
          <Badge color="#93c5fd" bg="#1e3a5f" border="#1e40af">Block #41824009</Badge>
        </div>
      </div>

      {/* Chain stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 22 }}>
        {[
          { l: "Total Blocks",    v: "41,824,009", c: "#3b82f6"  },
          { l: "CampusChain Txs", v: "3,891",      c: "#10b981"  },
          { l: "Reversed Today",  v: "23",         c: "#e879f9"  },
          { l: "Avg Block Time",  v: "2.1s",       c: "#f59e0b"  },
          { l: "Contract",        v: "0xCC01...",  c: "#14b8a6"  },
        ].map(s => (
          <div key={s.l} style={{ background: "#0f1117", border: `1px solid ${s.c}22`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: "'Space Mono',monospace" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Unique callout */}
      <div style={{ background: "#080c18", border: "1px solid #1e3a5f", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <UniqueBadge />
        <span style={{ fontSize: 12, color: "#93c5fd" }}>
          Every fraud block stores the AI score + reason on-chain forever. Judges can verify any transaction on mumbai.polygonscan.com in real-time.
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[{ id: "txns", l: "Transactions" }, { id: "blocks", l: "Blocks" }].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{
            padding: "7px 16px", borderRadius: 8, cursor: "pointer",
            border: view === t.id ? "1px solid #166534" : "1px solid #1f2937",
            background: view === t.id ? "#052e16" : "#0f1117",
            color: view === t.id ? "#4ade80" : "#9ca3af",
            fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif",
          }}>{t.l}</button>
        ))}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by hash, address, status..."
          style={{ flex: 1, padding: "7px 14px", borderRadius: 8, background: "#0f1117", border: "1px solid #374151", color: "#e5e7eb", fontSize: 12, fontFamily: "'Inter',sans-serif" }}
        />
      </div>

      {view === "txns" && (
        <div style={{ background: "#0f1117", border: "1px solid #1f2937", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 80px 100px", gap: 12, padding: "10px 20px", background: "#080b14", borderBottom: "1px solid #1f2937", fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            <span>TX Hash · Block</span><span>From → To</span><span>Value</span><span>Gas</span><span>AI Score</span><span>Status</span>
          </div>
          {filtered.map((tx, i) => {
            const cfg = statusConfig[tx.status] || statusConfig.confirmed;
            return (
              <div key={i} onClick={() => setInspecting(inspecting === i ? null : i)} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 80px 100px",
                gap: 12, padding: "12px 20px", alignItems: "center",
                borderBottom: "1px solid #111827", cursor: "pointer",
                background: tx.status === "reversed" ? "#1a0a2e" : tx.status === "flagged" ? "#1a0a0a" : "transparent",
              }}>
                <div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#6366f1" }}>{tx.hash}</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>Block #{tx.block} · {tx.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#e5e7eb" }}>{tx.from}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>→ {tx.to}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb", fontFamily: "'Space Mono',monospace" }}>{tx.value}</div>
                <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'Space Mono',monospace" }}>{tx.gas}</div>
                <ScorePill score={tx.ai} />
                <span style={{
                  display: "inline-block", fontSize: 10, padding: "3px 8px", borderRadius: 6,
                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                  fontWeight: 700, letterSpacing: "0.06em",
                }}>{cfg.label}</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px", color: "#4b5563", fontSize: 13 }}>
              No transactions match your search
            </div>
          )}
        </div>
      )}

      {view === "blocks" && (
        <div style={{ background: "#0f1117", border: "1px solid #1f2937", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, padding: "10px 20px", background: "#080b14", borderBottom: "1px solid #1f2937", fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            <span>Block Number</span><span>Transactions</span><span>Gas Used</span><span>Validator</span>
          </div>
          {BLOCKS.map((b, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, padding: "12px 20px", alignItems: "center", borderBottom: "1px solid #111827" }}>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#6366f1", fontWeight: 700 }}>#{b.number}</div>
                <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{b.time}</div>
              </div>
              <Badge color="#4ade80" bg="#052e16" border="#166534">{b.txs} txns</Badge>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#9ca3af" }}>{b.gas}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#4b5563" }}>{b.validator}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 11, color: "#374151", textAlign: "center" }}>
        Contract: 0xCampusChain...0001 &nbsp;·&nbsp; Polygon Mumbai Chain ID: 80001 &nbsp;·&nbsp;
        <span style={{ color: "#6366f1", cursor: "pointer" }}>View on mumbai.polygonscan.com ↗</span>
      </div>
    </div>
  );
}
