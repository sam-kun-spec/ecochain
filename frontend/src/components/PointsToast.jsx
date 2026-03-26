import React from "react";

function baseByType(type) {
  if (type === "success") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (type === "error") return "border-rose-200 bg-rose-50 text-rose-900";
  if (type === "points") return "border-brand-200 bg-brand-50 text-brand-900";
  return "border-slate-200 bg-white text-slate-900";
}

export default function PointsToast({ toast }) {
  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50">
      <div
        className={`pointer-events-auto w-[320px] rounded-2xl border p-4 shadow-card ${baseByType(
          toast.type
        )} animate-[ecochain_toast_.18s_ease-out]`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 ring-1 ring-black/5">
            <span className="text-lg" aria-hidden>
              {toast.type === "error" ? "⚠️" : toast.type === "points" ? "🌿" : "✅"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{toast.title}</div>
            {toast.message ? <div className="mt-0.5 text-sm opacity-90">{toast.message}</div> : null}
          </div>
        </div>
        {toast.type === "points" ? (
          <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Reward credited</span>
              <span className="font-semibold">{toast.meta?.points ?? 0} pts</span>
            </div>
          </div>
        ) : null}
      </div>
      <style>
        {`
          @keyframes ecochain_toast {
            from { transform: translateY(-6px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

