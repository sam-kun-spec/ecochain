import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import WasteTypeBadge, { WASTE_META } from "../components/WasteTypeBadge.jsx";

const WASTE_TYPES = ["Plastic", "Paper", "E-Waste", "Wet Waste", "Mixed"];
const POINTS_PER_KG = { Plastic: 10, Paper: 4, "E-Waste": 20, "Wet Waste": 2, Mixed: 5 };

function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">{title}</div>
          {subtitle ? <div className="mt-0.5 text-xs text-slate-600">{subtitle}</div> : null}
        </div>
        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatPill({ label, value, tone = "slate" }) {
  const toneCls =
    tone === "amber"
      ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
      : tone === "sky"
      ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
      : tone === "emerald"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      : "bg-slate-50 text-slate-800 ring-1 ring-slate-200";

  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${toneCls}`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-lg font-extrabold">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { pickups, users, loading, createPickup, householdUser } = useApp();
  const [form, setForm] = useState({
    location: "U Block, DLF Phase 3, Gurgaon",
    wasteType: "Plastic",
    quantity: 2,
    description: "",
  });

  const myPickups = useMemo(
    () => pickups.filter((p) => p.user?.toLowerCase() === householdUser.toLowerCase()),
    [pickups, householdUser]
  );

  const counts = useMemo(() => {
    const pending = myPickups.filter((p) => p.status === "pending").length;
    const inProgress = myPickups.filter((p) => p.status === "in_progress").length;
    const resolved = myPickups.filter((p) => p.status === "resolved").length;
    return { pending, inProgress, resolved };
  }, [myPickups]);

  const me = useMemo(() => {
    const u = users.find((x) => x.name?.toLowerCase() === householdUser.toLowerCase());
    return u ?? { name: householdUser, points: 0, kgRecycled: 0 };
  }, [users, householdUser]);

  const pointsBreakdown = useMemo(() => {
    const acc = {};
    for (const t of WASTE_TYPES) acc[t] = 0;
    for (const p of myPickups) {
      if (p.status === "collected" || p.status === "resolved") {
        acc[p.wasteType] = (acc[p.wasteType] ?? 0) + (p.points ?? 0);
      }
    }
    return acc;
  }, [myPickups]);

  const impact = useMemo(() => {
    const completed = myPickups.filter((p) => p.status === "resolved").length;
    const kg = myPickups
      .filter((p) => p.status === "resolved" || p.status === "collected")
      .reduce((sum, p) => sum + Number(p.quantity ?? 0), 0);
    return { completed, kg: Math.round(kg * 10) / 10 };
  }, [myPickups]);

  const lastFive = useMemo(() => myPickups.slice(0, 5), [myPickups]);
  const topFive = useMemo(() => users.slice(0, 5), [users]);

  async function onSubmit(e) {
    e.preventDefault();
    await createPickup({
      user: householdUser,
      location: form.location,
      wasteType: form.wasteType,
      quantity: Number(form.quantity),
      description: form.description,
    });
    setForm((p) => ({ ...p, quantity: 2, description: "" }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-card">
          <div className="text-2xl font-black tracking-tight">Recycle Smart. Earn Rewards.</div>
          <div className="mt-1 max-w-2xl text-sm text-white/90">
            Schedule a pickup and earn points for every kg recycled.
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
              Household: {householdUser}
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
              City: Gurgaon
            </div>
          </div>
        </div>

        <div id="schedule" className="scroll-mt-24">
          <Card
            title="Schedule a Pickup"
            subtitle="Submit details to request a collector visit."
            right={loading.createPickup ? <LoadingSpinner label="Submitting..." /> : null}
          >
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <div className="text-xs font-bold text-slate-700">Location</div>
                <input
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                />
              </label>

              <label>
                <div className="text-xs font-bold text-slate-700">Waste Type</div>
                <select
                  value={form.wasteType}
                  onChange={(e) => setForm((p) => ({ ...p, wasteType: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  {WASTE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div className="text-xs font-bold text-slate-700">Quantity (kg)</div>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                />
              </label>

              <label className="md:col-span-2">
                <div className="text-xs font-bold text-slate-700">Description</div>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border-slate-200 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                  placeholder="e.g., bottles, cardboard, old charger..."
                />
              </label>

              <div className="md:col-span-2 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  Estimated points:{" "}
                  <span className="font-extrabold text-slate-900">
                    {Math.round((POINTS_PER_KG[form.wasteType] ?? 0) * Number(form.quantity || 0))}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading.createPickup}
                  className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Schedule Pickup
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatPill label="Pending" value={counts.pending} tone="amber" />
          <StatPill label="In Progress" value={counts.inProgress} tone="sky" />
          <StatPill label="Resolved" value={counts.resolved} tone="emerald" />
        </div>

        <div id="reports" className="scroll-mt-24">
          <Card title="My Reports" subtitle="Your last 5 pickup requests.">
            {loading.refresh && pickups.length === 0 ? <LoadingSpinner /> : null}
            <div className="divide-y divide-slate-100">
              {lastFive.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-900">{p.location}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <WasteTypeBadge wasteType={p.wasteType} />
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-slate-500">{Number(p.quantity).toFixed(1)} kg</span>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {new Date(p.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
              {lastFive.length === 0 ? (
                <div className="py-6 text-sm text-slate-600">No reports yet. Schedule your first pickup above.</div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <Card title="My Reward Points" subtitle="Live points credited after collection.">
          <div className="flex items-end justify-between">
            <div className="text-4xl font-black tracking-tight text-slate-900">{me.points}</div>
            <div className="rounded-2xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
              Rank: {users.findIndex((u) => u.name?.toLowerCase() === householdUser.toLowerCase()) + 1 || "—"}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {WASTE_TYPES.map((t) => (
              <div key={t} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span aria-hidden>{WASTE_META[t]?.icon ?? "♻️"}</span>
                  <span>{t}</span>
                </div>
                <div className="text-xs font-extrabold text-slate-900">{pointsBreakdown[t] ?? 0} pts</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Impact Summary" subtitle="Your contribution to a cleaner city.">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="text-xs font-semibold text-slate-600">Kg diverted</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{impact.kg}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="text-xs font-semibold text-slate-600">Pickups completed</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{impact.completed}</div>
            </div>
          </div>
        </Card>

        <Card title="Leaderboard (Top 5)" subtitle="City rewards snapshot.">
          <div className="space-y-2">
            {topFive.map((u, idx) => (
              <div
                key={u.name}
                className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-50 text-xs font-black text-slate-800 ring-1 ring-slate-100">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.kgRecycled} kg recycled</div>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-brand-700">{u.points} pts</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

