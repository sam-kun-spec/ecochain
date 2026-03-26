import React, { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import WasteTypeBadge from "../components/WasteTypeBadge.jsx";

function Card({ title, subtitle, right, children }) {
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

export default function Collector() {
  const { pickups, collectorName, patchPickup, loading } = useApp();

  const pending = useMemo(() => pickups.filter((p) => p.status === "pending"), [pickups]);
  const active = useMemo(
    () => pickups.filter((p) => p.status === "in_progress" && p.collector === collectorName),
    [pickups, collectorName]
  );
  const completedToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return pickups.filter((p) => p.status === "collected" && p.collector === collectorName && new Date(p.createdAt) >= start)
      .length;
  }, [pickups, collectorName]);

  async function accept(p) {
    await patchPickup(p.id, { status: "in_progress", collector: collectorName });
  }

  async function markCollected(p) {
    await patchPickup(p.id, { status: "collected" }, { pointsToast: { enabled: true, points: p.points ?? 0, user: p.user } });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-slate-900">Collector Console</div>
            <div className="text-sm text-slate-600">Accept pickup requests and mark collections in real time.</div>
          </div>
          <div className="flex items-center gap-3">
            {loading.patchPickup ? <LoadingSpinner label="Updating..." /> : null}
            <div className="rounded-2xl bg-brand-50 px-4 py-2 text-sm font-extrabold text-brand-700 ring-1 ring-brand-100">
              Completed today: {completedToday}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Pending Requests" subtitle="New requests waiting for acceptance.">
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-slate-900">{p.location}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <WasteTypeBadge wasteType={p.wasteType} />
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-slate-500">{Number(p.quantity).toFixed(1)} kg</span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">User: {p.user}</div>
                  </div>
                  <button
                    onClick={() => accept(p)}
                    disabled={loading.patchPickup}
                    className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
                  >
                    Accept
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Submitted {new Date(p.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
            {pending.length === 0 ? <div className="text-sm text-slate-600">No pending requests right now.</div> : null}
          </div>
        </Card>

        <Card title="My Active Jobs" subtitle="Accepted pickups assigned to you.">
          <div className="space-y-3">
            {active.map((p) => (
              <div key={p.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-slate-900">{p.location}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <WasteTypeBadge wasteType={p.wasteType} />
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-slate-500">{Number(p.quantity).toFixed(1)} kg</span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">User: {p.user}</div>
                  </div>
                  <button
                    onClick={() => markCollected(p)}
                    disabled={loading.patchPickup}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
                  >
                    Mark Collected
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Accepted by {collectorName} • {p.points ?? 0} pts potential
                </div>
              </div>
            ))}
            {active.length === 0 ? <div className="text-sm text-slate-600">No active jobs. Accept one from the left.</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

