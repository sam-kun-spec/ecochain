import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const AppContext = createContext(null);

const API_BASE = `${import.meta.env.VITE_API_URL}`;  // ✅ template literal

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function AppProvider({ children }) {
  const [persona, setPersona] = useState("Household"); // Household | Collector | Recycling Center
  const [householdUser] = useState("Rahul");
  const [collectorName] = useState("Arjun");
  const [partnerName] = useState("GreenCycle Hub");

  const [pickups, setPickups] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState({
    bootstrap: false,
    createPickup: false,
    patchPickup: false,
    refresh: false,
  });

  const [toast, setToast] = useState(null); // {id, type, title, message, meta}
  const toastTimer = useRef(null);

  const showToast = useCallback((next) => {
    setToast({ id: Date.now(), ...next });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const apiFetch = useCallback(async (path, options) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
      ...options,
    });
    if (!res.ok) {
      let msg = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }
    return res.json();
  }, []);

  const refreshAll = useCallback(
    async ({ quiet } = {}) => {
    setLoading((p) => ({ ...p, refresh: !quiet }));
    try {
      const [p, u, s] = await Promise.all([
        apiFetch("/api/pickups"),
        apiFetch("/api/users"),
        apiFetch("/api/stats"),
      ]);
      setPickups(p);
      setUsers(u);
      setStats(s);
    } finally {
      setLoading((p) => ({ ...p, refresh: false, bootstrap: false }));
    }
    },
    [apiFetch]
  );

  const bootstrap = useCallback(async () => {
    setLoading((p) => ({ ...p, bootstrap: true }));
    await refreshAll({ quiet: true });
  }, [refreshAll]);

  const createPickup = useCallback(async (payload) => {
    setLoading((p) => ({ ...p, createPickup: true }));
    try {
      const created = await apiFetch("/api/pickups", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // keep UI snappy
      setPickups((prev) => [created, ...prev]);
      showToast({
        type: "success",
        title: "Pickup Scheduled!",
        message: "Collector will arrive soon.",
      });
      // backend is source of truth
      await sleep(200);
      await refreshAll({ quiet: true });
      return created;
    } catch (e) {
      showToast({ type: "error", title: "Couldn’t schedule pickup", message: e.message });
      throw e;
    } finally {
      setLoading((p) => ({ ...p, createPickup: false }));
    }
  }, [apiFetch, refreshAll, showToast]);

  const patchPickup = useCallback(async (id, patch, { pointsToast } = {}) => {
    setLoading((p) => ({ ...p, patchPickup: true }));
    try {
      const updated = await apiFetch(`/api/pickups/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setPickups((prev) => prev.map((x) => (x.id === id ? updated : x)));

      if (pointsToast?.enabled && pointsToast?.points > 0) {
        showToast({
          type: "points",
          title: `+${pointsToast.points} pts earned`,
          message: `Credited to ${pointsToast.user}`,
          meta: pointsToast,
        });
      }

      await sleep(150);
      await refreshAll({ quiet: true });
      return updated;
    } catch (e) {
      showToast({ type: "error", title: "Update failed", message: e.message });
      throw e;
    } finally {
      setLoading((p) => ({ ...p, patchPickup: false }));
    }
  }, [apiFetch, refreshAll, showToast]);

  const value = useMemo(
    () => ({
      persona,
      setPersona,
      householdUser,
      collectorName,
      partnerName,
      pickups,
      users,
      stats,
      loading,
      toast,
      showToast,
      bootstrap,
      refreshAll,
      createPickup,
      patchPickup,
    }),
    [
      persona,
      householdUser,
      collectorName,
      partnerName,
      pickups,
      users,
      stats,
      loading,
      toast,
      showToast,
      bootstrap,
      refreshAll,
      createPickup,
      patchPickup,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

