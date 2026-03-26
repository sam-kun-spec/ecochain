import React, { useEffect, useMemo } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ViewSwitcher from "./components/ViewSwitcher.jsx";
import PointsToast from "./components/PointsToast.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Collector from "./pages/Collector.jsx";
import Recycling from "./pages/Recycling.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Impact from "./pages/Impact.jsx";

function PersonaBadge() {
  const { persona, householdUser, collectorName, partnerName } = useApp();
  const text = useMemo(() => {
    if (persona === "Collector") return `${collectorName} - Collector`;
    if (persona === "Recycling Center") return `${partnerName} - Partner`;
    return `${householdUser} - Citizen`;
  }, [persona, householdUser, collectorName, partnerName]);

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-slate-800 shadow-sm ring-1 ring-slate-200">
      <span aria-hidden>👤</span>
      <span>{text}</span>
    </div>
  );
}

function TopBar() {
  const { loading } = useApp();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">EcoChain | Smart Waste System</div>
          <div className="mt-0.5 text-xs text-slate-600">Smart waste pickup and rewards demo (in-memory)</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {loading.bootstrap ? <LoadingSpinner label="Connecting..." /> : null}
          {loading.refresh ? <LoadingSpinner label="Syncing..." /> : null}
          <ViewSwitcher />
          <PersonaBadge />
        </div>
      </div>
    </header>
  );
}

function RoutePersonaSync() {
  const { setPersona } = useApp();
  const loc = useLocation();
  useEffect(() => {
    if (loc.pathname.startsWith("/collector")) setPersona("Collector");
    else if (loc.pathname.startsWith("/recycling")) setPersona("Recycling Center");
    else setPersona("Household");
  }, [loc.pathname, setPersona]);
  return null;
}

export default function App() {
  const { bootstrap, toast } = useApp();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <div className="h-full bg-slate-50 font-sans">
      <RoutePersonaSync />
      <div className="flex h-full">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <TopBar />
          <main className="px-6 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/collector" element={<Collector />} />
              <Route path="/recycling" element={<Recycling />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route
                path="*"
                element={
                  <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <div className="text-lg font-black text-slate-900">Page not found</div>
                    <div className="mt-1 text-sm text-slate-600">Use the sidebar to navigate.</div>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
      <PointsToast toast={toast} />
    </div>
  );
}

