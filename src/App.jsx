import { useState, Suspense, lazy } from "react";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import WalletPage from "./pages/WalletPage.jsx";
import PayPage from "./pages/PayPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ChainPage from "./pages/ChainPage.jsx";

function FraudPlaceholder() {
  return (
    <div style={{ padding: "40px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🛡</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#e879f9", marginBottom: 8 }}>AI Fraud Monitor</div>
      <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>
        Paste your existing fraud detection dashboard code into{" "}
        <code style={{ color: "#a5b4fc", background: "#1e1b4b", padding: "2px 8px", borderRadius: 4 }}>
          src/pages/FraudPage.jsx
        </code>
        {" "}with a default export. It will automatically render here. The file already contains your full AI fraud detection dashboard — just rename it.
      </div>
      <div style={{ marginTop: 20, fontSize: 11, color: "#374151" }}>
        Your existing App.jsx → rename to FraudPage.jsx → export default App → done ✓
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "home":   return <HomePage setPage={setPage} />;
      case "wallet": return <WalletPage />;
      case "pay":    return <PayPage />;
      case "fraud":  return <FraudPlaceholder />;
      case "admin":  return <AdminPage />;
      case "chain":  return <ChainPage />;
      default:       return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060810", color: "#f9fafb", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060810; }
        input, select, button, textarea { font-family: 'Inter', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0f1117; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
        input[type=range] { accent-color: #7c3aed; }
        select option { background: #0f1117; }
      `}</style>
      <Navbar active={page} setPage={setPage} />
      <main style={{ animation: "fadeIn 0.3s ease" }} key={page}>
        {renderPage()}
      </main>
    </div>
  );
}
