import React from "react";
import { NavLink } from "react-router-dom";

const LINK_BASE =
  "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition";

function linkClass({ isActive }) {
  if (isActive) {
    return `${LINK_BASE} bg-brand-50 text-brand-700 ring-1 ring-brand-100`;
  }
  return `${LINK_BASE} text-slate-700 hover:bg-slate-50`;
}

export default function Sidebar() {
  return (
    <aside className="h-full w-[260px] flex-shrink-0 border-r border-slate-100 bg-white px-4 py-5">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-sm">
          <span className="text-lg font-black">E</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">EcoChain</div>
          <div className="truncate text-xs font-semibold text-slate-500">Smart Waste System</div>
        </div>
      </div>

      <div className="mt-6 space-y-1">
        <NavLink to="/" className={linkClass} end>
          <span aria-hidden>🏠</span> Dashboard
        </NavLink>
        <a
          href="#schedule"
          className={`${LINK_BASE} text-slate-700 hover:bg-slate-50`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("schedule");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span aria-hidden>📅</span> Schedule Pickup
        </a>
        <a
          href="#reports"
          className={`${LINK_BASE} text-slate-700 hover:bg-slate-50`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("reports");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span aria-hidden>🧾</span> My Reports
        </a>
        <NavLink to="/leaderboard" className={linkClass}>
          <span aria-hidden>🏅</span> Leaderboard
        </NavLink>
        <NavLink to="/impact" className={linkClass}>
          <span aria-hidden>🌍</span> Impact
        </NavLink>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <div className="text-xs font-bold text-slate-700">Today’s tip</div>
        <div className="mt-1 text-xs text-slate-600">
          Rinse plastics before pickup to improve recycling quality and increase processing speed.
        </div>
      </div>
    </aside>
  );
}

