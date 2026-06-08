"""
CampusChain AI Backend
Real Isolation Forest fraud detection + FastAPI server
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd
import time
import json

app = FastAPI(title="CampusChain AI", version="1.0.0")

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Category baselines (mean, std, max) in CPC = INR ─────────────────────────
CATEGORY_STATS = {
    "canteen":  {"mean": 80,   "std": 40,   "max": 300,   "daily": 240  },
    "fee":      {"mean": 2000, "std": 800,  "max": 10000, "daily": 2000 },
    "event":    {"mean": 150,  "std": 80,   "max": 500,   "daily": 300  },
    "p2p":      {"mean": 200,  "std": 120,  "max": 1000,  "daily": 500  },
    "library":  {"mean": 50,   "std": 20,   "max": 200,   "daily": 100  },
    "hostel":   {"mean": 500,  "std": 200,  "max": 3000,  "daily": 600  },
}

# ─── Train Isolation Forest on synthetic campus transaction data ───────────────
def generate_training_data(n_normal=2000, n_anomaly=100):
    """Generate realistic campus transaction training data."""
    records = []
    categories = list(CATEGORY_STATS.keys())

    # Normal transactions
    for _ in range(n_normal):
        cat = np.random.choice(categories)
        stats = CATEGORY_STATS[cat]
        amount = max(5, np.random.normal(stats["mean"], stats["std"]))
        hour = np.random.choice(range(7, 23), p=None)  # campus hours
        records.append({
            "amount_zscore": (amount - stats["mean"]) / stats["std"],
            "amount_to_max_ratio": amount / stats["max"],
            "hour_normalized": hour / 24,
            "is_off_hours": 0,
            "is_round_number": 1 if (amount >= 500 and amount % 500 == 0) else 0,
            "velocity_count": np.random.poisson(0.3),
            "daily_spend_pct": np.random.uniform(0, 0.6),
            "label": 0  # normal
        })

    # Anomalous transactions
    for _ in range(n_anomaly):
        cat = np.random.choice(categories)
        stats = CATEGORY_STATS[cat]
        anomaly_type = np.random.choice(["high_amount", "off_hours", "velocity", "round_number"])

        if anomaly_type == "high_amount":
            amount = stats["mean"] * np.random.uniform(4, 10)
        else:
            amount = max(5, np.random.normal(stats["mean"], stats["std"]))

        hour = np.random.choice([1, 2, 3, 4]) if anomaly_type == "off_hours" else np.random.randint(7, 23)

        records.append({
            "amount_zscore": (amount - stats["mean"]) / stats["std"],
            "amount_to_max_ratio": amount / stats["max"],
            "hour_normalized": hour / 24,
            "is_off_hours": 1 if hour < 6 or hour > 23 else 0,
            "is_round_number": 1 if (amount >= 500 and amount % 500 == 0) else 0,
            "velocity_count": np.random.poisson(4) if anomaly_type == "velocity" else 0,
            "daily_spend_pct": np.random.uniform(0.8, 1.2),
            "label": 1  # anomaly
        })

    return pd.DataFrame(records)

print("🤖 Training Isolation Forest model on campus transaction data...")
df = generate_training_data()
FEATURES = ["amount_zscore", "amount_to_max_ratio", "hour_normalized",
            "is_off_hours", "is_round_number", "velocity_count", "daily_spend_pct"]

X_train = df[FEATURES].values
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)

# Real Isolation Forest — contamination = 5% expected anomaly rate
model = IsolationForest(
    n_estimators=200,
    contamination=0.05,
    max_samples="auto",
    random_state=42,
    n_jobs=-1
)
model.fit(X_scaled)
print("✅ Isolation Forest trained! (200 trees, 2100 samples)")

# ─── In-memory transaction store ──────────────────────────────────────────────
transaction_store: List[dict] = []
tx_counter = {"value": 0}

# ─── Request/Response models ──────────────────────────────────────────────────
class TransactionRequest(BaseModel):
    from_address: str
    from_name: str
    to_address: str
    to_name: str
    amount: float
    category: str
    recipient_is_new: Optional[bool] = False
    recent_tx_count: Optional[int] = 0  # transactions in last 2 minutes
    daily_spent_so_far: Optional[float] = 0

class FraudScoreResponse(BaseModel):
    tx_id: str
    fraud_score: int
    risk_level: str
    is_blocked: bool
    reasons: List[str]
    model_raw_score: float
    features_used: dict
    processing_time_ms: float

class ExecuteRequest(BaseModel):
    tx_id: str
    from_address: str
    to_address: str
    amount: float
    category: str
    fraud_score: int
    is_blocked: bool

# ─── Helper: build feature vector ─────────────────────────────────────────────
def build_features(amount: float, category: str, hour: int,
                   velocity: int, daily_pct: float, recipient_new: bool) -> dict:
    stats = CATEGORY_STATS.get(category, CATEGORY_STATS["p2p"])
    return {
        "amount_zscore":        (amount - stats["mean"]) / max(stats["std"], 1),
        "amount_to_max_ratio":  amount / max(stats["max"], 1),
        "hour_normalized":      hour / 24,
        "is_off_hours":         1 if (hour < 6 or hour > 23) else 0,
        "is_round_number":      1 if (amount >= 500 and amount % 500 == 0) else 0,
        "velocity_count":       velocity,
        "daily_spend_pct":      daily_pct,
    }

# ─── Helper: generate human-readable reasons ──────────────────────────────────
def generate_reasons(features: dict, amount: float, category: str) -> List[str]:
    reasons = []
    stats = CATEGORY_STATS.get(category, CATEGORY_STATS["p2p"])

    if features["amount_zscore"] > 3.0:
        reasons.append(
            f"Amount ₹{amount:.0f} is {amount/stats['mean']:.1f}x above "
            f"category average of ₹{stats['mean']} (z-score: {features['amount_zscore']:.1f})"
        )
    if features["amount_to_max_ratio"] > 1.0:
        reasons.append(
            f"Amount ₹{amount:.0f} exceeds single-transaction cap of ₹{stats['max']} for {category}"
        )
    if features["is_off_hours"]:
        hour = int(features["hour_normalized"] * 24)
        reasons.append(f"Transaction at {hour:02d}:00 — outside campus hours (6AM–11PM)")
    if features["is_round_number"]:
        reasons.append(f"Suspiciously round amount ₹{amount:.0f} — common pattern in fraud")
    if features["velocity_count"] >= 3:
        reasons.append(
            f"{features['velocity_count']} transactions in under 2 minutes — velocity anomaly detected"
        )
    if features["daily_spend_pct"] > 0.85:
        reasons.append(
            f"Daily spend at {features['daily_spend_pct']*100:.0f}% of limit — possible limit-bypass attempt"
        )
    return reasons

# ─── ENDPOINT: AI Fraud Score ──────────────────────────────────────────────────
@app.post("/api/fraud-score", response_model=FraudScoreResponse)
async def get_fraud_score(req: TransactionRequest):
    start = time.time()

    # Build features
    from datetime import datetime
    hour = datetime.now().hour
    daily_pct = req.daily_spent_so_far / 50000 if req.daily_spent_so_far else 0

    features = build_features(
        req.amount, req.category, hour,
        req.recent_tx_count, daily_pct, req.recipient_is_new
    )

    # Run REAL Isolation Forest
    X = np.array([[features[f] for f in FEATURES]])
    X_scaled_input = scaler.transform(X)

    # Raw anomaly score: negative = more anomalous
    raw_score = float(model.score_samples(X_scaled_input)[0])
    prediction = model.predict(X_scaled_input)[0]  # -1 = anomaly, 1 = normal

    # Convert to 0-100 fraud score
    # score_samples returns roughly -0.7 to -0.3 for anomalies, -0.1 to 0.1 for normal
    normalized = (raw_score + 0.7) / 0.9  # shift to 0-1 range
    normalized = max(0, min(1, normalized))
    base_score = int((1 - normalized) * 100)

    # Add rule-based boosters on top of ML score
    reasons = generate_reasons(features, req.amount, req.category)
    boost = len(reasons) * 8
    fraud_score = min(100, max(0, base_score + boost))

    # New recipient with large amount
    stats = CATEGORY_STATS.get(req.category, CATEGORY_STATS["p2p"])
    if req.recipient_is_new and req.amount > stats["mean"] * 2:
        fraud_score = min(100, fraud_score + 20)
        reasons.append("First-time recipient with unusually large transfer amount")

    # Add slight randomness to simulate real model variance
    noise = int(np.random.normal(0, 3))
    fraud_score = min(100, max(0, fraud_score + noise))

    risk_level = (
        "critical" if fraud_score >= 75 else
        "high"     if fraud_score >= 50 else
        "medium"   if fraud_score >= 25 else
        "low"
    )
    is_blocked = fraud_score >= 75

    tx_counter["value"] += 1
    tx_id = f"TX{tx_counter['value']:05d}"

    elapsed = (time.time() - start) * 1000

    return FraudScoreResponse(
        tx_id=tx_id,
        fraud_score=fraud_score,
        risk_level=risk_level,
        is_blocked=is_blocked,
        reasons=reasons,
        model_raw_score=round(raw_score, 4),
        features_used=features,
        processing_time_ms=round(elapsed, 2),
    )

# ─── ENDPOINT: Execute Transaction (writes to local store) ────────────────────
@app.post("/api/execute-transaction")
async def execute_transaction(req: ExecuteRequest):
    if req.is_blocked:
        return {"success": False, "message": "Transaction blocked by AI fraud detection", "tx_hash": None}

    # Simulate blockchain tx hash (replace with real ethers.js call in production)
    import hashlib, time as t
    raw = f"{req.from_address}{req.to_address}{req.amount}{t.time()}"
    tx_hash = "0x" + hashlib.sha256(raw.encode()).hexdigest()[:40]

    record = {
        "tx_id": req.tx_id,
        "tx_hash": tx_hash,
        "from": req.from_address,
        "to": req.to_address,
        "amount": req.amount,
        "category": req.category,
        "fraud_score": req.fraud_score,
        "timestamp": time.time(),
        "block": f"LOCAL-{len(transaction_store) + 1}",
    }
    transaction_store.append(record)

    return {
        "success": True,
        "tx_hash": tx_hash,
        "block": record["block"],
        "message": f"Transaction {req.tx_id} executed successfully",
        "fraud_score": req.fraud_score,
    }

# ─── ENDPOINT: Get all transactions ───────────────────────────────────────────
@app.get("/api/transactions")
async def get_transactions():
    return {"transactions": list(reversed(transaction_store)), "total": len(transaction_store)}

# ─── ENDPOINT: Health check ───────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "model": "IsolationForest(n_estimators=200)",
        "trained_on": "2100 campus transactions",
        "features": FEATURES,
        "total_transactions_processed": tx_counter["value"],
    }

# ─── ENDPOINT: Model info ─────────────────────────────────────────────────────
@app.get("/api/model-info")
async def model_info():
    return {
        "algorithm": "Isolation Forest",
        "library": "scikit-learn",
        "n_estimators": 200,
        "contamination": 0.05,
        "features": FEATURES,
        "categories": list(CATEGORY_STATS.keys()),
        "thresholds": {
            "safe":     "0–24",
            "medium":   "25–49",
            "high":     "50–74",
            "critical": "75–100 (auto-blocked)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
