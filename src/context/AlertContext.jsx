import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import assets from "../data/assets";
import { useNotifications } from "./NotificationContext";
import { usePriceFeed } from "./PriceFeedContext";
import { useAuth } from "./AuthContext";

const AlertContext = createContext(null);
const STORAGE_PREFIX = "tradesim-alerts-";

function storageKey(userId) { return userId ? `${STORAGE_PREFIX}${userId}` : null; }
function loadAlerts(key) {
  if (!key) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function AlertProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { prices } = usePriceFeed();
  const { addNotification } = useNotifications();
  const key = storageKey(user?.id);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => setAlerts(loadAlerts(key)), [key]);
  useEffect(() => { if (key) localStorage.setItem(key, JSON.stringify(alerts)); }, [key, alerts]);

  const addAlert = useCallback(({ assetId, condition, targetPrice }) => {
    const numericTarget = Number(targetPrice);
    if (!assets.some((asset) => asset.id === assetId) || numericTarget <= 0) return;
    setAlerts((current) => [...current, {
      id: crypto.randomUUID(), assetId, condition, targetPrice: numericTarget,
      active: true, triggered: false, createdAt: Date.now(),
    }]);
  }, []);

  const removeAlert = useCallback((id) => setAlerts((current) => current.filter((alert) => alert.id !== id)), []);
  const toggleAlert = useCallback((id) => setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, active: !alert.active } : alert)), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setAlerts((current) => {
      let changed = false;
      const next = current.map((alert) => {
        if (!alert.active || alert.triggered) return alert;
        const price = prices[alert.assetId] || 0;
        const reached = alert.condition === "above" ? price >= alert.targetPrice : price <= alert.targetPrice;
        if (!reached) return alert;
        const asset = assets.find((item) => item.id === alert.assetId);
        changed = true;
        addNotification({
          assetId: alert.assetId,
          category: alert.condition === "above" ? "priceUp" : "priceDown",
          type: "success",
          title: "Price Alert",
          message: `${asset?.symbol || alert.assetId} reached $${price.toFixed(2)}.`,
        });
        return { ...alert, active: false, triggered: true, triggeredAt: Date.now() };
      });
      return changed ? next : current;
    });
  }, [prices, isAuthenticated, addNotification]);

  const value = useMemo(() => ({ alerts, addAlert, removeAlert, toggleAlert }), [alerts, addAlert, removeAlert, toggleAlert]);
  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlerts must be used inside AlertProvider");
  return context;
}
