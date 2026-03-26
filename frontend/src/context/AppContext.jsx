import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const AppContext = createContext(null);

// ─── helpers ────────────────────────────────────────────────────────────────

const POINTS_PER_KG = { Plastic: 10, Paper: 4, "E-Waste": 20, "Wet Waste": 2, Mixed: 5 };

function clamp(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.max(0, x) : fallback;
}
function nowISO() { return new Date().toISOString(); }
function makeId() { return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16); }
function calcPoints(wasteType, qty) { return Math.round((POINTS_PER_KG[wasteType] ?? 0) * clamp(qty)); }

// ─── seed data ───────────────────────────────────────────────────────────────

const SEED_USERS = [
  { name: "Asha",   points: 610, kgRecycled: 62 },
  { name: "Rahul",  points: 540, kgRecycled: 49 },
  { name: "Neha",   points: 490, kgRecycled: 44 },
  { name: "Vikram", points: 430, kgRecycled: 39 },
  { name: "Sana",   points: 390, kgRecycled: 35 },
  { name: "Imran",  points: 340, kgRecycled: 31 },
  { name: "Pooja",  points: 310, kgRecycled: 28 },
  { name: "Karan",  points: 270, kgRecycled: 24 },
];

function makeSeedPickups() {
  const ago = (mins) => new Date(Date.now() - 1000 * 60 * mins).toISOString();
  return [
    { id: "p1",  user: "Rahul",  location: "U Block, DLF Phase 3, Gurgaon", wasteType: "Plastic",   quantity: 1.2, description: "Bottles and packaging",    status: "pending",     createdAt: ago(40),  collector: null,    points: calcPoints("Plastic",   1.2) },
    { id: "p2",  user: "Neha",   location: "Sushant Lok 1, Gurgaon",        wasteType: "Paper",     quantity: 3,   description: "Old newspapers",           status: "in_progress", createdAt: ago(80),  collector: "Arjun", points: calcPoints("Paper",     3)   },
    { id: "p3",  user: "Asha",   location: "Sector 56, Gurgaon",            wasteType: "E-Waste",   quantity: 0.6, description: "Old charger + cables",     status: "collected",   createdAt: ago(180), collector: "Arjun", points: calcPoints("E-Waste",   0.6) },
    { id: "p4",  user: "Vikram", location: "Cyber City, Gurgaon",           wasteType: "Mixed",     quantity: 2.5, description: "Mixed recyclables",        status: "resolved",    createdAt: ago(300), collector: "Arjun", points: calcPoints("Mixed",     2.5) },
    { id: "p5",  user: "Rahul",  location: "U Block, DLF Phase 3, Gurgaon", wasteType: "Wet Waste", quantity: 4,   description: "Kitchen scraps",           status: "resolved",    createdAt: ago(420), collector: "Arjun", points: calcPoints("Wet Waste", 4)   },
    { id: "p6",  user: "Sana",   location: "Sector 45, Gurgaon",            wasteType: "Plastic",   quantity: 2.2, description: "PET bottles",              status: "pending",     createdAt: ago(18),  collector: null,    points: calcPoints("Plastic",   2.2) },
    { id: "p7",  user: "Imran",  location: "Palam Vihar, Gurgaon",          wasteType: "Paper",     quantity: 1.8, description: "Cardboard",                status: "collected",   createdAt: ago(220), collector: "Arjun", points: calcPoints("Paper",     1.8) },
    { id: "p8",  user: "Pooja",  location: "Sector 29, Gurgaon",            wasteType: "Mixed",     quantity: 1.1, description: "Mixed items",              status: "in_progress", createdAt: ago(55),  collector: "Arjun", points: calcPoints("Mixed",     1.1) },
    { id: "p9",  user: "Karan",  location: "MG Road, Gurgaon",              wasteType: "E-Waste",   quantity: 0.9, description: "Old mouse + keyboard",     status: "pending",     createdAt: ago(12),  collector: null,    points: calcPoints("E-Waste",   0.9) },
    { id: "p10", user: "Rahul",  location: "U Block, DLF Phase 3, Gurgaon", wasteType: "Paper",     quantity: 2.6, description: "Magazines and paper waste", status: "in_progress", createdAt: ago(95),  collector: "Arjun", points: calcPoints("Paper",     2.6) },
  ];
}

function computeStats(pickups) {
  const totalKg = pickups
    .filter((p) => ["resolved", "collected", "in_progress"].includes(p.status))
    .reduce((s, p) => s + clamp(p.quantity), 0);
  const pickupsCompleted = pickups.filter((p) => p.status === "resolved").length;
  const activeCitizens = new Set(pickups.map((p) => p.user)).size;
  const byType = {};
  for (const p of pickups) byType[p.wasteType] = (byType[p.wasteType] ?? 0) + clamp(p.quantity);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    return { day: label, pickups: Math.max(3, 8 + i + (i % 2 === 0 ? 2 : -1) + (i === 6 ? 4 : 0)) };
  });
  return {
    totalKgDiverted: Math.round(totalKg * 10) / 10,
    co2Saved: Math.round(totalKg * 2.5 * 10) / 10,
    pickupsCompleted,
    activeCitizens,
    wasteTypeDistribution: Object.entries(byType).map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 })),
    pickupsOver7Days: days,
  };
}

// ─── provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [persona, setPersona] = useState("Household");
  const [householdUser] = useState("Rahul");
  const [collectorName]  = useState("Arjun");
  const [partnerName]    = useState("GreenCycle Hub");

  // In-memory store — lives for the whole browser session
  const [pickups, setPickups] = useState(() => makeSeedPickups());
  const [users,   setUsers]   = useState(() => SEED_USERS.map((u) => ({ ...u })));

  const stats = useMemo(() => computeStats(pickups), [pickups]);

  const [loading, setLoading] = useState({ bootstrap: false, createPickup: false, patchPickup: false, refresh: false });
  const [toast,   setToast]   = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((next) => {
    setToast({ id: Date.now(), ...next });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // bootstrap — nothing to fetch, just a tiny delay so UI feels real
  const bootstrap = useCallback(async () => {
    setLoading((p) => ({ ...p, bootstrap: true }));
    await new Promise((r) => setTimeout(r, 300));
    setLoading((p) => ({ ...p, bootstrap: false }));
  }, []);

  const refreshAll = useCallback(async () => {
    // state is already live — nothing to do
  }, []);

  // ── createPickup ──────────────────────────────────────────────────────────
  const createPickup = useCallback(async (payload) => {
    setLoading((p) => ({ ...p, createPickup: true }));
    try {
      const { user, location, wasteType, quantity, description } = payload;
      const safeQty = clamp(quantity);
      if (!location || !wasteType || safeQty <= 0) throw new Error("location, wasteType, and quantity are required.");
      if (!(wasteType in POINTS_PER_KG)) throw new Error("Invalid wasteType.");

      // ensure user exists
      setUsers((prev) => {
        if (prev.find((u) => u.name.toLowerCase() === user.toLowerCase())) return prev;
        return [...prev, { name: user, points: 0, kgRecycled: 0 }];
      });

      const newPickup = {
        id: makeId(),
        user,
        location,
        wasteType,
        quantity: safeQty,
        description: description ?? "",
        status: "pending",
        createdAt: nowISO(),
        collector: null,
        points: calcPoints(wasteType, safeQty),
      };

      setPickups((prev) => [newPickup, ...prev]);
      showToast({ type: "success", title: "Pickup Scheduled!", message: "Collector will arrive soon." });
      return newPickup;
    } catch (e) {
      showToast({ type: "error", title: "Couldn't schedule pickup", message: e.message });
      throw e;
    } finally {
      setLoading((p) => ({ ...p, createPickup: false }));
    }
  }, [showToast]);

  // ── patchPickup ───────────────────────────────────────────────────────────
  const patchPickup = useCallback(async (id, patch, { pointsToast } = {}) => {
    setLoading((p) => ({ ...p, patchPickup: true }));
    try {
      let updated;
      setPickups((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx === -1) return prev;
        updated = { ...prev[idx], ...patch };
        const next = [...prev];
        next[idx] = updated;
        return next;
      });

      // Credit points when status moves to "collected" (once per pickup)
      if (patch.status === "collected") {
        setUsers((prev) => {
          const idx = prev.findIndex((u) => u.name.toLowerCase() === (updated?.user ?? "").toLowerCase());
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            points:     next[idx].points     + clamp(updated?.points   ?? 0),
            kgRecycled: next[idx].kgRecycled + clamp(updated?.quantity ?? 0),
          };
          return next;
        });
      }

      if (pointsToast?.enabled && pointsToast?.points > 0) {
        showToast({
          type: "points",
          title: `+${pointsToast.points} pts earned`,
          message: `Credited to ${pointsToast.user}`,
          meta: pointsToast,
        });
      }

      return updated;
    } catch (e) {
      showToast({ type: "error", title: "Update failed", message: e.message });
      throw e;
    } finally {
      setLoading((p) => ({ ...p, patchPickup: false }));
    }
  }, [showToast]);

  const value = useMemo(() => ({
    persona, setPersona,
    householdUser, collectorName, partnerName,
    pickups, users, stats,
    loading, toast,
    showToast, bootstrap, refreshAll,
    createPickup, patchPickup,
  }), [persona, householdUser, collectorName, partnerName, pickups, users, stats, loading, toast, showToast, bootstrap, refreshAll, createPickup, patchPickup]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}