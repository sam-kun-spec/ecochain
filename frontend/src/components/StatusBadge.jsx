import React from "react";

const STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  in_progress: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  collected: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  collected: "Collected",
  resolved: "Resolved",
};

export default function StatusBadge({ status }) {
  const key = String(status ?? "pending");
  const cls = STYLES[key] ?? "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  const label = LABELS[key] ?? key;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

