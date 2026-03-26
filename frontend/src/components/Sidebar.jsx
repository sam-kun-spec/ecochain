import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const LINK_BASE =
  "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition";

function linkClass({ isActive }) {
  if (isActive) {
    return `${LINK_BASE} bg-brand-50 text-brand-700 ring-1 ring-brand-100`;
  }
  return `${LINK_BASE} text-slate-700 hover:bg-slate-50`;
}

function SidebarContent({ onClose }) {
  return (
    <>
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
        <NavLink to="/" className={linkClass} end onClick={onClose}>
          <span aria-hidden>🏠</span> Dashboard
        </NavLink>
        <a
          href="#schedule"
          className={`${LINK_BASE} text-slate-700 hover:bg-slate-50`}
          onClick={(e) => {
            e.preventDefault();
            onClose?.();
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
            onClose?.();
            const el = document.getElementById("reports");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span aria-hidden>🧾</span> My Reports
        </a>
        <NavLink to="/leaderboard" className={linkClass} onClick={onClose}>
          <span aria-hidden>🏅</span> Leaderboard
        </NavLink>
        <NavLink to="/impact" className={linkClass} onClick={onClose}>
          <span aria-hidden>🌍</span> Impact
        </NavLink>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <div className="text-xs font-bold text-slate-700">Today's tip</div>
        <div className="mt-1 text-xs text-slate-600">
          Rinse plastics before pickup to improve recycling quality and increase processing speed.
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  // Close on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Desktop: always-visible sidebar (unchanged) ── */}
      <aside className="hidden md:flex h-full w-[260px] flex-shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-5">
        <SidebarContent />
      </aside>

      {/* ── Mobile: hamburger button ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <span className="block h-[2px] w-5 bg-slate-700 rounded" />
        <span className="block h-[2px] w-5 bg-slate-700 rounded" />
        <span className="block h-[2px] w-5 bg-slate-700 rounded" />
      </button>

      {/* ── Mobile: overlay ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile: drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-[260px] flex-shrink-0 border-r border-slate-100 bg-white px-4 py-5 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl leading-none"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          ✕
        </button>
        <SidebarContent onClose={() => setOpen(false)} />
      </aside>
    </>
  );
}