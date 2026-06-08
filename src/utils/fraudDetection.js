// CampusChain AI Fraud Detection Engine
// Simulates Isolation Forest + rule-based anomaly detection
// In production: replace with Python FastAPI backend serving a real sklearn model

const CATEGORIES = ["canteen", "fee", "event", "p2p", "library", "hostel"];

// Historical baseline per category (mean, stddev in CPC)
const CATEGORY_BASELINE = {
  canteen:  { mean: 80,   std: 40,   maxSingle: 300  },
  fee:      { mean: 2000, std: 800,  maxSingle: 10000 },
  event:    { mean: 150,  std: 80,   maxSingle: 500  },
  p2p:      { mean: 200,  std: 120,  maxSingle: 1000 },
  library:  { mean: 50,   std: 20,   maxSingle: 200  },
  hostel:   { mean: 500,  std: 200,  maxSingle: 3000 },
};

// Fraud reason templates
const FRAUD_REASONS = {
  amount_spike:    (x, mean) => `Amount ${x} CPC is ${(x/mean).toFixed(1)}x above category average`,
  velocity:        (n) => `${n} transactions in under 2 minutes — velocity anomaly`,
  time_anomaly:    (h) => `Transaction at ${h}:00 — outside normal campus hours`,
  round_number:    (x) => `Suspiciously round amount: ${x} CPC — common in fraud patterns`,
  cross_category:  ()  => `Unusual cross-category spend pattern detected`,
  new_recipient:   ()  => `First-time recipient with unusually large transfer`,
  daily_limit:     (pct) => `Daily spend at ${pct}% of limit — potential limit-bypass attempt`,
};

/**
 * Core fraud scoring function
 * Returns { score: 0-100, reasons: string[], risk: 'low'|'medium'|'high'|'critical' }
 */
export function computeFraudScore(transaction, userHistory = []) {
  const { amount, category, timestamp, recipientIsNew = false } = transaction;
  const baseline = CATEGORY_BASELINE[category] || CATEGORY_BASELINE.p2p;
  const hour = new Date(timestamp).getHours();

  let score = 0;
  const reasons = [];

  // 1. Amount anomaly (z-score based, like Isolation Forest)
  const zScore = Math.abs((amount - baseline.mean) / baseline.std);
  if (zScore > 3.5) {
    const contribution = Math.min(45, Math.round(zScore * 10));
    score += contribution;
    reasons.push(FRAUD_REASONS.amount_spike(amount, baseline.mean));
  } else if (zScore > 2) {
    score += Math.round(zScore * 6);
  }

  // 2. Absolute cap breach
  if (amount > baseline.maxSingle) {
    score += 20;
    reasons.push(`Amount exceeds single-transaction cap of ${baseline.maxSingle} CPC for ${category}`);
  }

  // 3. Velocity check (transactions in last 2 minutes)
  const now = timestamp;
  const recentTxns = userHistory.filter(tx =>
    now - tx.timestamp < 2 * 60 * 1000 && tx.id !== transaction.id
  );
  if (recentTxns.length >= 3) {
    score += 25;
    reasons.push(FRAUD_REASONS.velocity(recentTxns.length + 1));
  } else if (recentTxns.length >= 2) {
    score += 12;
  }

  // 4. Off-hours detection (campus hours: 6am - 11pm)
  if (hour < 6 || hour > 23) {
    score += 15;
    reasons.push(FRAUD_REASONS.time_anomaly(hour));
  }

  // 5. Round number heuristic
  if (amount >= 1000 && amount % 500 === 0) {
    score += 10;
    reasons.push(FRAUD_REASONS.round_number(amount));
  }

  // 6. New recipient with large amount
  if (recipientIsNew && amount > baseline.mean * 2) {
    score += 20;
    reasons.push(FRAUD_REASONS.new_recipient());
  }

  // 7. Daily spend pattern
  const todaySpent = userHistory
    .filter(tx => {
      const txDate = new Date(tx.timestamp).toDateString();
      const today = new Date(timestamp).toDateString();
      return txDate === today && !tx.blocked;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const dailyPct = Math.round((todaySpent / 50000) * 100); // 50000 CPC daily limit
  if (dailyPct > 80) {
    score += 15;
    reasons.push(FRAUD_REASONS.daily_limit(dailyPct));
  }

  // Clamp to 0-100
  score = Math.min(100, Math.max(0, score));

  // Add noise to simulate real ML model variance
  const noise = (Math.random() - 0.5) * 6;
  score = Math.min(100, Math.max(0, Math.round(score + noise)));

  const risk =
    score >= 75 ? "critical" :
    score >= 50 ? "high" :
    score >= 25 ? "medium" : "low";

  return { score, reasons, risk };
}

/**
 * Generate a realistic mock transaction
 */
export function generateMockTransaction(id, users, forceAnomaly = false) {
  const sender = users[Math.floor(Math.random() * users.length)];
  const recipients = users.filter(u => u.address !== sender.address);
  const recipient = recipients[Math.floor(Math.random() * recipients.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const baseline = CATEGORY_BASELINE[category];

  let amount;
  if (forceAnomaly) {
    // Generate clearly anomalous amount
    amount = Math.round(baseline.mean * (4 + Math.random() * 6));
  } else {
    // Normal distribution around mean
    const u1 = Math.random(), u2 = Math.random();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    amount = Math.max(10, Math.round(baseline.mean + normal * baseline.std));
  }

  return {
    id,
    from: sender.address,
    fromName: sender.name,
    to: recipient.address,
    toName: recipient.name,
    amount,
    category,
    timestamp: Date.now(),
    recipientIsNew: Math.random() < 0.1,
    status: "pending",
    fraudScore: null,
    risk: null,
    reasons: [],
    blocked: false,
  };
}

/**
 * Mock users for demo
 */
export const MOCK_USERS = [
  { address: "0xA1B2...3C4D", name: "Arjun Sharma",    rollNo: "CS21001", balance: 12400 },
  { address: "0xE5F6...7G8H", name: "Priya Mehta",     rollNo: "EC21034", balance: 8750  },
  { address: "0xI9J0...K1L2", name: "Rohan Gupta",     rollNo: "ME21089", balance: 15200 },
  { address: "0xM3N4...O5P6", name: "Sneha Patil",     rollNo: "IT21012", balance: 6300  },
  { address: "0xQ7R8...S9T0", name: "Dev Krishnan",    rollNo: "CS21056", balance: 22100 },
  { address: "0xU1V2...W3X4", name: "Ananya Singh",    rollNo: "EC21078", balance: 9800  },
  { address: "0xY5Z6...A7B8", name: "Vikram Joshi",    rollNo: "ME21023", balance: 11500 },
  { address: "0xC9D0...E1F2", name: "Kavya Nair",      rollNo: "IT21067", balance: 7200  },
  { address: "0xADMN...0001", name: "Campus Admin",    rollNo: "ADMIN",   balance: 999999 },
  { address: "0xCNTN...0002", name: "Central Canteen", rollNo: "VENDOR",  balance: 45000  },
];
