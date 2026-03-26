import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "../context/AppContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import WasteTypeBadge from "../components/WasteTypeBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

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

export default function Recycling() {
  const { pickups, partnerName, patchPickup, loading } = useApp();

  const incoming = useMemo(() => pickups.filter((p) => p.status === "collected"), [pickups]);
  const resolvedToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return pickups.filter((p) => p.status === "resolved" && new Date(p.createdAt) >= start);
  }, [pickups]);

  const byType = useMemo(() => {
    const map = {};
    for (const p of resolvedToday) {
      map[p.wasteType] = (map[p.wasteType] ?? 0) + Number(p.quantity ?? 0);
    }
    return Object.entries(map).map(([wasteType, kg]) => ({ wasteType, kg: Math.round(kg * 10) / 10 }));
  }, [resolvedToday]);

  async function process(p) {
    await patchPickup(p.id, { status: "resolved" });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-slate-900">Recycling Center</div>
            <div className="text-sm text-slate-600">Process collected waste into resolved reports.</div>
          </div>
          <div className="flex items-center gap-3">
            {loading.patchPickup ? <LoadingSpinner label="Updating..." /> : null}
            <div className="rounded-2xl bg-brand-50 px-4 py-2 text-sm font-extrabold text-brand-700 ring-1 ring-brand-100">
              {partnerName} - Partner
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <Card title="Incoming Waste" subtitle="Collected pickups awaiting processing.">
          <div className="space-y-3">
            {incoming.map((p) => (
              <div key={p.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-slate-900">{p.location}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <WasteTypeBadge wasteType={p.wasteType} />
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-slate-500">{Number(p.quantity).toFixed(1)} kg</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Source: <span className="font-semibold">{p.user}</span> • Area: Gurgaon
                    </div>
                  </div>
                  <button
                    onClick={() => process(p)}
                    disabled={loading.patchPickup}
                    className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
                  >
                    Process
                  </button>
                </div>
              </div>
            ))}
            {incoming.length === 0 ? <div className="text-sm text-slate-600">No incoming waste right now.</div> : null}
          </div>
        </Card>

        <Card
          title="Processed Today"
          subtitle="Breakdown by waste type (kg)."
          right={<div className="text-sm font-extrabold text-slate-900">{resolvedToday.length} pickups</div>}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="wasteType" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="kg" fill="#1a7a4a" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {byType.length === 0 ? (
            <div className="mt-2 text-sm text-slate-600">No processed pickups yet today.</div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

