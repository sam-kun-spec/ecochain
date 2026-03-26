import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const POINTS_PER_KG = {
  Plastic: 10,
  Paper: 4,
  "E-Waste": 20,
  "Wet Waste": 2,
  Mixed: 5,
};

function clampNonNegativeNumber(n, fallback = 0) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(0, x);
}

function nowISO() {
  return new Date().toISOString();
}

function makeId() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function calcPoints(wasteType, quantityKg) {
  const rate = POINTS_PER_KG[wasteType] ?? 0;
  return Math.round(rate * clampNonNegativeNumber(quantityKg));
}

function normalizeStatus(status) {
  if (!status) return undefined;
  const s = String(status).toLowerCase().trim();
  if (s === "pending") return "pending";
  if (s === "in_progress" || s === "in progress") return "in_progress";
  if (s === "collected") return "collected";
  if (s === "resolved") return "resolved";
  return undefined;
}

// In-memory seed data
const users = [
  { name: "Asha", points: 610, kgRecycled: 62 },
  { name: "Rahul", points: 540, kgRecycled: 49 },
  { name: "Neha", points: 490, kgRecycled: 44 },
  { name: "Vikram", points: 430, kgRecycled: 39 },
  { name: "Sana", points: 390, kgRecycled: 35 },
  { name: "Imran", points: 340, kgRecycled: 31 },
  { name: "Pooja", points: 310, kgRecycled: 28 },
  { name: "Karan", points: 270, kgRecycled: 24 }
];

const pickups = [
  {
    id: "p1",
    user: "Rahul",
    location: "U Block, DLF Phase 3, Gurgaon",
    wasteType: "Plastic",
    quantity: 1.2,
    description: "Bottles and packaging",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    collector: null,
    points: calcPoints("Plastic", 1.2),
  },
  {
    id: "p2",
    user: "Neha",
    location: "Sushant Lok 1, Gurgaon",
    wasteType: "Paper",
    quantity: 3,
    description: "Old newspapers",
    status: "in_progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    collector: "Arjun",
    points: calcPoints("Paper", 3),
  },
  {
    id: "p3",
    user: "Asha",
    location: "Sector 56, Gurgaon",
    wasteType: "E-Waste",
    quantity: 0.6,
    description: "Old charger + cables",
    status: "collected",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    collector: "Arjun",
    points: calcPoints("E-Waste", 0.6),
  },
  {
    id: "p4",
    user: "Vikram",
    location: "Cyber City, Gurgaon",
    wasteType: "Mixed",
    quantity: 2.5,
    description: "Mixed recyclables",
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    collector: "Arjun",
    points: calcPoints("Mixed", 2.5),
  },
  {
    id: "p5",
    user: "Rahul",
    location: "U Block, DLF Phase 3, Gurgaon",
    wasteType: "Wet Waste",
    quantity: 4,
    description: "Kitchen scraps",
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    collector: "Arjun",
    points: calcPoints("Wet Waste", 4),
  },
  {
    id: "p6",
    user: "Sana",
    location: "Sector 45, Gurgaon",
    wasteType: "Plastic",
    quantity: 2.2,
    description: "PET bottles",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    collector: null,
    points: calcPoints("Plastic", 2.2),
  },
  {
    id: "p7",
    user: "Imran",
    location: "Palam Vihar, Gurgaon",
    wasteType: "Paper",
    quantity: 1.8,
    description: "Cardboard",
    status: "collected",
    createdAt: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    collector: "Arjun",
    points: calcPoints("Paper", 1.8),
  },
  {
    id: "p8",
    user: "Pooja",
    location: "Sector 29, Gurgaon",
    wasteType: "Mixed",
    quantity: 1.1,
    description: "Mixed items",
    status: "in_progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    collector: "Arjun",
    points: calcPoints("Mixed", 1.1),
  },
  {
    id: "p9",
    user: "Karan",
    location: "MG Road, Gurgaon",
    wasteType: "E-Waste",
    quantity: 0.9,
    description: "Old mouse + keyboard",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    collector: null,
    points: calcPoints("E-Waste", 0.9),
  },
  {
    id: "p10",
    user: "Rahul",
    location: "U Block, DLF Phase 3, Gurgaon",
    wasteType: "Paper",
    quantity: 2.6,
    description: "Magazines and paper waste",
    status: "in_progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    collector: "Arjun",
    points: calcPoints("Paper", 2.6),
  },
];

// Credit points for already-collected seed items once at startup
const credited = new Set();
for (const p of pickups) {
  if (p.status === "collected" || p.status === "resolved") {
    credited.add(p.id);
  }
}

function findUser(name) {
  const u = users.find((x) => x.name.toLowerCase() === String(name).toLowerCase());
  return u ?? null;
}

function pickupToDto(p) {
  return { ...p };
}

function computeStats() {
  const totalKgDiverted = pickups
    .filter((p) => p.status === "resolved" || p.status === "collected" || p.status === "in_progress")
    .reduce((sum, p) => sum + clampNonNegativeNumber(p.quantity), 0);

  const pickupsCompleted = pickups.filter((p) => p.status === "resolved").length;
  const activeCitizens = new Set(pickups.map((p) => p.user)).size;

  const byType = {};
  for (const p of pickups) {
    byType[p.wasteType] = (byType[p.wasteType] ?? 0) + clampNonNegativeNumber(p.quantity);
  }

  const co2Saved = Math.round(totalKgDiverted * 2.5 * 10) / 10;

  // 7-day demo line series (synthetic but stable-ish)
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const base = 8 + idx;
    const noise = (idx % 2 === 0 ? 2 : -1);
    const todayBoost = idx === 6 ? 4 : 0;
    return { day: label, pickups: Math.max(3, base + noise + todayBoost) };
  });

  return {
    totalKgDiverted: Math.round(totalKgDiverted * 10) / 10,
    co2Saved,
    pickupsCompleted,
    activeCitizens,
    wasteTypeDistribution: Object.entries(byType).map(([name, value]) => ({
      name,
      value: Math.round(value * 10) / 10,
    })),
    pickupsOver7Days: days,
  };
}

app.get("/api/pickups", (req, res) => {
  const { user, status } = req.query;
  const normalizedStatus = normalizeStatus(status);

  let result = pickups.slice();
  if (user) {
    const u = String(user).toLowerCase();
    result = result.filter((p) => p.user.toLowerCase() === u);
  }
  if (normalizedStatus) {
    result = result.filter((p) => p.status === normalizedStatus);
  }

  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(result.map(pickupToDto));
});

app.post("/api/pickups", (req, res) => {
  const { user, location, wasteType, quantity, description } = req.body ?? {};
  const safeUser = (user ?? "Rahul").toString().trim() || "Rahul";
  const safeLocation = (location ?? "").toString().trim();
  const safeWasteType = (wasteType ?? "").toString().trim();
  const safeQty = clampNonNegativeNumber(quantity, 0);
  const safeDesc = (description ?? "").toString().trim();

  if (!safeLocation || !safeWasteType || safeQty <= 0) {
    return res.status(400).json({ error: "location, wasteType, and quantity are required." });
  }
  if (!(safeWasteType in POINTS_PER_KG)) {
    return res.status(400).json({ error: "Invalid wasteType." });
  }

  const existingUser = findUser(safeUser);
  if (!existingUser) {
    users.push({ name: safeUser, points: 0, kgRecycled: 0 });
  }

  const p = {
    id: makeId(),
    user: safeUser,
    location: safeLocation,
    wasteType: safeWasteType,
    quantity: safeQty,
    description: safeDesc,
    status: "pending",
    createdAt: nowISO(),
    collector: null,
    points: calcPoints(safeWasteType, safeQty),
  };

  pickups.unshift(p);
  res.status(201).json(pickupToDto(p));
});

app.patch("/api/pickups/:id", (req, res) => {
  const { id } = req.params;
  const idx = pickups.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Pickup not found." });

  const current = pickups[idx];
  const nextStatus = normalizeStatus(req.body?.status) ?? current.status;
  const nextCollector =
    req.body?.collector === undefined ? current.collector : (req.body.collector ?? null);

  const updated = { ...current, status: nextStatus, collector: nextCollector };
  pickups[idx] = updated;

  // Credit points when status changes to collected (once)
  if (updated.status === "collected" && !credited.has(updated.id)) {
    const u = findUser(updated.user);
    if (u) {
      u.points += clampNonNegativeNumber(updated.points);
      u.kgRecycled += clampNonNegativeNumber(updated.quantity);
    }
    credited.add(updated.id);
  }

  // If it gets resolved without being collected (unlikely), still ensure credit happened
  if (updated.status === "resolved" && !credited.has(updated.id)) {
    const u = findUser(updated.user);
    if (u) {
      u.points += clampNonNegativeNumber(updated.points);
      u.kgRecycled += clampNonNegativeNumber(updated.quantity);
    }
    credited.add(updated.id);
  }

  res.json(pickupToDto(updated));
});

app.get("/api/users", (req, res) => {
  const sorted = users
    .slice()
    .sort((a, b) => b.points - a.points || b.kgRecycled - a.kgRecycled || a.name.localeCompare(b.name));
  res.json(sorted);
});

app.get("/api/stats", (req, res) => {
  res.json(computeStats());
});

app.get("/api/health", (req, res) => res.json({ ok: true, time: nowISO() }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`EcoChain backend running on http://localhost:${PORT}`);
});

