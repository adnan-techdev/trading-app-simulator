import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import assets from "../data/assets";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);
const eventTypes = ["priceUp", "priceDown", "buy", "sell", "autoBuy", "autoSell"];
const defaultPreferences = () => Object.fromEntries(assets.map((asset) => [asset.id, {
  notification: Object.fromEntries(eventTypes.map((event) => [event, true])),
  toast: Object.fromEntries(eventTypes.map((event) => [event, true])),
}]));

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const preferenceKey = user?.id ? `tradesim-notification-preferences-${user.id}` : null;

  useEffect(() => {
    if (!preferenceKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(preferenceKey) || "null");
      if (saved) setPreferences((current) => Object.fromEntries(assets.map((asset) => [asset.id, {
        notification: { ...current[asset.id].notification, ...(saved[asset.id]?.notification || {}) },
        toast: { ...current[asset.id].toast, ...(saved[asset.id]?.toast || {}) },
      }])));
    } catch { /* use defaults */ }
  }, [preferenceKey]);

  useEffect(() => {
    if (preferenceKey) localStorage.setItem(preferenceKey, JSON.stringify(preferences));
  }, [preferenceKey, preferences]);

  const addNotification = useCallback(({ type = "info", title, message, assetId, category = "buy" }) => {
    const assetPreferences = assetId ? preferences[assetId] : null;
    const showNotification = !assetPreferences || assetPreferences.notification[category] !== false;
    const showToast = !assetPreferences || assetPreferences.toast[category] !== false;
    if (!showNotification && !showToast) return;
    const id = crypto.randomUUID();
    const notification = { id, type, title, message, assetId, category, createdAt: Date.now() };
    if (showNotification) setNotifications((current) => [notification, ...current].slice(0, 1000));
    if (showToast) setToastNotifications((current) => [notification, ...current].slice(0, 5));
  }, [preferences]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
    setToastNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const [toastNotifications, setToastNotifications] = useState([]);
  const togglePreference = useCallback((assetId, channel, category) => {
    setPreferences((current) => ({ ...current, [assetId]: { ...current[assetId], [channel]: { ...current[assetId][channel], [category]: !current[assetId][channel][category] } } }));
  }, []);
  const setAllPreferences = useCallback((channel, enabled) => {
    setPreferences((current) => Object.fromEntries(assets.map((asset) => [asset.id, { ...current[asset.id], [channel]: Object.fromEntries(eventTypes.map((event) => [event, enabled])) }])));
  }, []);
  const setAssetPreferences = useCallback((assetId, channel, enabled) => {
    setPreferences((current) => ({ ...current, [assetId]: { ...current[assetId], [channel]: Object.fromEntries(eventTypes.map((event) => [event, enabled])) } }));
  }, []);

  const value = useMemo(() => ({ notifications, toastNotifications, addNotification, removeNotification, clearNotifications, preferences, togglePreference, setAllPreferences, setAssetPreferences }), [
    notifications,
    toastNotifications,
    addNotification,
    removeNotification,
    clearNotifications,
    preferences,
    togglePreference,
    setAllPreferences,
    setAssetPreferences,
  ]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
}
