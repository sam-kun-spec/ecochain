import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const OPTIONS = [
  { persona: "Household", label: "Household", route: "/" },
  { persona: "Collector", label: "Collector", route: "/collector" },
  { persona: "Recycling Center", label: "Recycling Center", route: "/recycling" },
];

export default function ViewSwitcher() {
  const { persona, setPersona } = useApp();
  const nav = useNavigate();
  const loc = useLocation();

  function onChange(e) {
    const next = e.target.value;
    const opt = OPTIONS.find((o) => o.persona === next);
    setPersona(next);
    if (opt && loc.pathname !== opt.route) nav(opt.route);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-semibold text-slate-600 md:inline">Switch to:</span>
      <select
        value={persona}
        onChange={onChange}
        className="rounded-xl border-slate-200 text-sm font-semibold text-slate-800 shadow-sm focus:border-brand-500 focus:ring-brand-500"
      >
        {OPTIONS.map((o) => (
          <option key={o.persona} value={o.persona}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

