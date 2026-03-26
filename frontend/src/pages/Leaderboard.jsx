import React, { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";

function badgeFor(points) {
  if (points >= 550) return { label: "Eco Warrior", cls: "bg-brand-50 text-brand-700 ring-1 ring-brand-100" };
  if (points >= 400) return { label: "Green Champion", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" };
  return { label: "Recycler", cls: "bg-slate-50 text-slate-700 ring-1 ring-slate-200" };
}

export default function Leaderboard() {
  const { users, householdUser } = useApp();

  const rows = useMemo(
    () =>
      users.map((u, idx) => {
        const b = badgeFor(u.points);
        return { ...u, rank: idx + 1, badge: b };
      }),
    [users]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-slate-900">City Leaderboard</div>
            <div className="text-sm text-slate-600">Rewards ranked by points and recycling impact.</div>
          </div>
          <div className="rounded-2xl bg-brand-50 px-4 py-2 text-sm font-extrabold text-brand-700 ring-1 ring-brand-100">
            Highlight: {householdUser}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-100">
        <div className="grid grid-cols-[80px_1fr_140px_140px_160px] gap-0 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-extrabold text-slate-600">
          <div>Rank</div>
          <div>Name</div>
          <div>Points</div>
          <div>Kg recycled</div>
          <div>Badge</div>
        </div>
        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div
              key={r.name}
              className={`grid grid-cols-[80px_1fr_140px_140px_160px] items-center gap-0 px-5 py-4 ${
                r.name?.toLowerCase() === householdUser.toLowerCase() ? "bg-brand-50/40" : "bg-white"
              }`}
            >
              <div className="text-sm font-black text-slate-900">{r.rank}</div>
              <div className="text-sm font-extrabold text-slate-900">{r.name}</div>
              <div className="text-sm font-extrabold text-brand-700">{r.points}</div>
              <div className="text-sm font-bold text-slate-700">{r.kgRecycled}</div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${r.badge.cls}`}>
                  {r.badge.label}
                </span>
              </div>
            </div>
          ))}
          {rows.length === 0 ? <div className="px-5 py-6 text-sm text-slate-600">No users found.</div> : null}
        </div>
      </div>
    </div>
  );
}

