import React from "react";

const WASTE_META = {
  Plastic: { icon: "🧴", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  Paper: { icon: "📰", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  "E-Waste": { icon: "💻", cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
  "Wet Waste": { icon: "🍃", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  Mixed: { icon: "♻️", cls: "bg-slate-50 text-slate-700 ring-1 ring-slate-200" },
};

export default function WasteTypeBadge({ wasteType }) {
  const meta = WASTE_META[wasteType] ?? { icon: "♻️", cls: "bg-slate-50 text-slate-700 ring-1 ring-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${meta.cls}`}>
      <span aria-hidden>{meta.icon}</span>
      <span>{wasteType}</span>
    </span>
  );
}

export { WASTE_META };

