import React, { useMemo } from "react";
import { Line, LineChart, Pie, PieChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useApp } from "../context/AppContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const PIE_COLORS = ["#1a7a4a", "#3bbf7b", "#6fd19c", "#9fe0bc", "#c9edd8", "#115232"];

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

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="text-xs font-bold text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

export default function Impact() {
  const { stats, loading } = useApp();

  const city = stats ?? {
    totalKgDiverted: 0,
    co2Saved: 0,
    pickupsCompleted: 0,
    activeCitizens: 0,
    pickupsOver7Days: [],
    wasteTypeDistribution: [],
  };

  const pie = useMemo(() => city.wasteTypeDistribution ?? [], [city]);
  const line = useMemo(() => city.pickupsOver7Days ?? [], [city]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-card">
        <div className="text-2xl font-black tracking-tight">Impact Dashboard</div>
        <div className="mt-1 text-sm text-white/90">City-wide progress across pickups, recycling, and CO₂ savings.</div>
      </div>

      {loading.refresh && !stats ? (
        <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
          <LoadingSpinner />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total kg diverted" value={city.totalKgDiverted} />
        <Stat label="CO₂ saved" value={`${city.co2Saved} kg`} />
        <Stat label="Pickups completed" value={city.pickupsCompleted} />
        <Stat label="Active citizens" value={city.activeCitizens} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Pickups over 7 days" subtitle="Daily pickup volume trend.">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={line}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="pickups" stroke="#1a7a4a" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Waste type distribution" subtitle="Share of reported waste (kg).">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {pie.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Gurgaon Waste Activity Map" subtitle="Placeholder demo card (no real map).">
        <div className="flex h-56 items-center justify-center rounded-3xl bg-slate-50 text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
          Map placeholder
        </div>
      </Card>
    </div>
  );
}

