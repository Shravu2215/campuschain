# ⛓ CampusChain AI — Fraud Detection Dashboard
## 📸 Dashboard Preview

![CampusChain Dashboard](screenshots/dashboard.png)

> Blockchain-Powered Campus Financial Ecosystem with Real-Time AI Fraud Detection  
> Built for hackathon demo — React + Solidity + Polygon Mumbai

---
## 🚀 Quick Start (5 minutes to running demo)

### 1. Install dependencies
```bash
npm install
```

### 2. Run the frontend (demo mode — no blockchain needed)
```bash
npm run dev
```
Open http://localhost:5173 — the full AI fraud detection dashboard works immediately in demo mode with simulated transactions.

---

## ⛓ Deploy Smart Contract to Polygon Mumbai

### Prerequisites
- MetaMask with Polygon Mumbai testnet added
- Some test MATIC from https://faucet.polygon.technology/

### Setup environment
```bash
cp .env.example .env
# Fill in your PRIVATE_KEY and RPC URL
```

### Deploy
```bash
npx hardhat run scripts/deploy.cjs --network mumbai
```

Copy the deployed contract address into your `.env`:
```
VITE_CONTRACT_ADDRESS=0x...your deployed address...
VITE_CHAIN_ID=80001
```

---

## 🤖 AI Fraud Detection — How It Works

The AI engine (`src/utils/fraudDetection.js`) implements a **multi-signal anomaly detector** inspired by Isolation Forest:

| Signal | Weight | Description |
|--------|--------|-------------|
| Amount Z-Score | Up to 45pts | Statistical deviation from category baseline |
| Absolute Cap | 20pts | Single transaction cap per category |
| Velocity | Up to 25pts | >3 txns in 2 minutes |
| Off-Hours | 15pts | Transactions outside 6am–11pm |
| Round Numbers | 10pts | Suspicious round amounts |
| New Recipient | 20pts | First-time large transfer |
| Daily Limit | 15pts | >80% daily spend in one session |

**Score ≥ 75 → Auto-blocked by smart contract + transaction reversed**  
**Score 50–74 → Flagged for admin review**  
**Score < 50 → Safe, processed normally**

### In Production
Replace the JS model with a Python FastAPI backend:
```python
from sklearn.ensemble import IsolationForest
# Train on historical campus transaction data
# Expose /score endpoint → returns fraud_score (0-100)
```

---

## 📁 Project Structure

```
campuschain/
├── contracts/
│   └── CampusChain.sol          # Smart contract (ERC-20 + fraud logic)
├── scripts/
│   └── deploy.cjs               # Hardhat deployment script
├── src/
│   ├── utils/
│   │   └── fraudDetection.js    # AI fraud scoring engine
│   ├── App.jsx                  # Main dashboard component
│   └── main.jsx                 # React entry point
├── index.html
├── vite.config.js
├── hardhat.config.cjs
└── package.json
```

---

## 🏆 Hackathon Demo Script (2 minutes)

1. **Start** → Click "Start Live Feed" — show real-time transactions flowing in
2. **AI scoring** → Point out the fraud score gauge updating in real time (200-800ms delay = AI processing)
3. **Inject Fraud** → Click the red "🚨 Inject Fraud" button — watch the purple alert banner appear
4. **Inspect** → Click any transaction to open the inspector — show AI detection signals
5. **Filters** → Switch to "blocked" filter — show all auto-reversed fraudulent transactions
6. **Explain** → "Every flagged transaction is reversed on-chain by the smart contract automatically — no human needed"

---

## 🔧 Smart Contract — Key Features

- **CampusCoin (CPC)** — ERC-20 campus token
- **Smart fraud blocking** — AI oracle submits score, contract auto-reverses if ≥75
- **Daily spending limits** — enforced on-chain per student
- **Category-aware** — fee, canteen, event, p2p, library, hostel
- **Admin controls** — block accounts, update thresholds, mint tokens
- **Full audit trail** — every transaction immutably recorded

---

## 🌐 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Smart Contract | Solidity 0.8.19 |
| Blockchain | Polygon Mumbai (Chain ID 80001) |
| AI Engine | Isolation Forest (JS demo) / sklearn (production) |
| Web3 | ethers.js v6 |
| Dev Tools | Hardhat |
