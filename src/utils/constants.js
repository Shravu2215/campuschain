export const COLORS = {
  bg:       "#060810",
  bg2:      "#0f1117",
  bg3:      "#0a0d16",
  border:   "#1f2937",
  border2:  "#374151",
  purple:   "#7c3aed",
  purple2:  "#a855f7",
  blue:     "#3b82f6",
  green:    "#10b981",
  amber:    "#f59e0b",
  red:      "#ef4444",
  pink:     "#ec4899",
  teal:     "#14b8a6",
  indigo:   "#6366f1",
};

export const CATEGORY_META = {
  canteen:  { label: "Canteen",     color: "#10b981", avg: 80,   maxSingle: 300,   daily: 240,  monthly: 2400,  icon: "🍽", examples: "Lunch, snacks, tea" },
  fee:      { label: "Tuition Fee", color: "#6366f1", avg: 2000, maxSingle: 10000, daily: 2000, monthly: 20000, icon: "🎓", examples: "Semester, lab, exam" },
  event:    { label: "Events",      color: "#f59e0b", avg: 150,  maxSingle: 500,   daily: 300,  monthly: 1500,  icon: "🎟", examples: "Fests, workshops" },
  p2p:      { label: "P2P",         color: "#3b82f6", avg: 200,  maxSingle: 1000,  daily: 500,  monthly: 3000,  icon: "👤", examples: "Student transfers" },
  library:  { label: "Library",     color: "#8b5cf6", avg: 50,   maxSingle: 200,   daily: 100,  monthly: 600,   icon: "📚", examples: "Fine, printing, books" },
  hostel:   { label: "Hostel",      color: "#ec4899", avg: 500,  maxSingle: 3000,  daily: 600,  monthly: 6000,  icon: "🏠", examples: "Rent, laundry, mess" },
};

export const MOCK_STUDENTS = [
  { id: "CS21001", name: "Arjun Sharma",   dept: "Computer Science", year: 3, balance: 3840, cgpa: 8.7, address: "0xA1B2...3C4D", avatar: "AS", color: "#6366f1",
    spends: { canteen: 960, fee: 4000, hostel: 1500, event: 300, library: 80, p2p: 320 } },
  { id: "EC21034", name: "Priya Mehta",    dept: "Electronics",      year: 3, balance: 5200, cgpa: 9.1, address: "0xE5F6...7G8H", avatar: "PM", color: "#ec4899",
    spends: { canteen: 720, fee: 4000, hostel: 2000, event: 450, library: 120, p2p: 510 } },
  { id: "ME21089", name: "Rohan Gupta",    dept: "Mechanical",       year: 3, balance: 1200, cgpa: 7.4, address: "0xI9J0...K1L2", avatar: "RG", color: "#f59e0b",
    spends: { canteen: 1800, fee: 4000, hostel: 1500, event: 200, library: 50, p2p: 250 } },
  { id: "IT21012", name: "Sneha Patil",    dept: "Info Technology",  year: 3, balance: 4100, cgpa: 8.3, address: "0xM3N4...O5P6", avatar: "SP", color: "#10b981",
    spends: { canteen: 640, fee: 4000, hostel: 1000, event: 100, library: 60, p2p: 100 } },
  { id: "CS21056", name: "Dev Krishnan",   dept: "Computer Science", year: 3, balance: 6800, cgpa: 9.5, address: "0xQ7R8...S9T0", avatar: "DK", color: "#14b8a6",
    spends: { canteen: 480, fee: 2000, hostel: 1500, event: 120, library: 100, p2p: 0   } },
  { id: "EC21078", name: "Ananya Singh",   dept: "Electronics",      year: 3, balance: 2900, cgpa: 8.0, address: "0xU1V2...W3X4", avatar: "AS", color: "#a855f7",
    spends: { canteen: 1100, fee: 4000, hostel: 1500, event: 350, library: 80, p2p: 70  } },
];

export const RECENT_TXS = [
  { id: "00041", from: "Arjun Sharma",  to: "Central Canteen", amount: 85,   category: "canteen", time: "10:32 AM", score: 8,  status: "safe"    },
  { id: "00042", from: "Priya Mehta",   to: "Hostel Block A",  amount: 500,  category: "hostel",  time: "10:28 AM", score: 12, status: "safe"    },
  { id: "00043", from: "Rohan Gupta",   to: "Dev Krishnan",    amount: 4200, category: "p2p",     time: "10:21 AM", score: 67, status: "flagged" },
  { id: "00044", from: "Sneha Patil",   to: "Library",         amount: 8000, category: "library", time: "10:18 AM", score: 91, status: "blocked" },
  { id: "00045", from: "Dev Krishnan",  to: "Accounts Dept",   amount: 2000, category: "fee",     time: "10:15 AM", score: 6,  status: "safe"    },
  { id: "00046", from: "Ananya Singh",  to: "Techfest 2025",   amount: 300,  category: "event",   time: "10:09 AM", score: 22, status: "safe"    },
];

export const SCHOLARSHIPS = [
  { id: "SCH001", name: "Merit Excellence Award",    condition: "CGPA ≥ 9.0",         reward: 2000, recipients: 12, status: "active",  nextRun: "Jan 1, 2026" },
  { id: "SCH002", name: "Attendance Hero Bonus",     condition: "Attendance ≥ 90%",    reward: 500,  recipients: 87, status: "active",  nextRun: "Dec 1, 2025" },
  { id: "SCH003", name: "Sports Achievement Grant",  condition: "Inter-college medal",  reward: 1500, recipients: 5,  status: "active",  nextRun: "Manual" },
  { id: "SCH004", name: "Financial Aid Program",     condition: "Family income < 5LPA", reward: 3000, recipients: 34, status: "paused",  nextRun: "Review pending" },
];

export const CHAIN_TXS = [
  { hash: "0x7f3a9c2e...b42d1f", block: "41823991", from: "0xA1B2...3C4D", to: "0xCNTN...0002", value: "85 CPC",   gas: "21,000", ai: 8,  status: "confirmed", time: "2 min ago"  },
  { hash: "0x2d1e8b4a...9f3c7e", block: "41823994", from: "0xM3N4...O5P6", to: "0xLIB....0003", value: "8000 CPC", gas: "45,230", ai: 91, status: "reversed",  time: "5 min ago"  },
  { hash: "0x9c4b3d7f...2a8e1c", block: "41823998", from: "0xQ7R8...S9T0", to: "0xACC....0001", value: "2000 CPC", gas: "21,000", ai: 6,  status: "confirmed", time: "8 min ago"  },
  { hash: "0x4e7a1b9d...6c3f2a", block: "41824001", from: "0xE5F6...7G8H", to: "0xHST....0004", value: "500 CPC",  gas: "21,000", ai: 12, status: "confirmed", time: "10 min ago" },
  { hash: "0x1f8c5e3b...4d7a9f", block: "41824005", from: "0xI9J0...K1L2", to: "0xU1V2...W3X4", value: "4200 CPC", gas: "32,100", ai: 67, status: "flagged",   time: "14 min ago" },
  { hash: "0x8a2d4f7c...3b1e6d", block: "41824009", from: "0xU1V2...W3X4", to: "0xFST....0005", value: "300 CPC",  gas: "21,000", ai: 22, status: "confirmed", time: "18 min ago" },
];
