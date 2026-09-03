import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import assets from "../data/assets";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import { usePortfolio } from "./PortfolioContext";
import { usePriceFeed } from "./PriceFeedContext";

const AutoSellContext = createContext(null);
const STORAGE_PREFIX = "tradesim-auto-sell-";
const AUTO_BUY_STORAGE_PREFIX = "tradesim-auto-buy-";
const keyFor = (id) => id ? `${STORAGE_PREFIX}${id}` : null;
const buyKeyFor = (id) => id ? `${AUTO_BUY_STORAGE_PREFIX}${id}` : null;

function loadRules(key) {
  if (!key) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function AutoSellProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { prices } = usePriceFeed();
  const { cash, holdings, buy, sell } = usePortfolio();
  const { addNotification } = useNotifications();
  const key = keyFor(user?.id);
  const buyKey = buyKeyFor(user?.id);
  const [rules, setRules] = useState([]);
  const [buyRules, setBuyRules] = useState([]);

  useEffect(() => setRules(loadRules(key)), [key]);
  useEffect(() => setBuyRules(loadRules(buyKey)), [buyKey]);
  useEffect(() => { if (key) localStorage.setItem(key, JSON.stringify(rules)); }, [key, rules]);
  useEffect(() => { if (buyKey) localStorage.setItem(buyKey, JSON.stringify(buyRules)); }, [buyKey, buyRules]);

  const addRule = useCallback(({ assetId, targetPrice, quantity }) => {
    const target = Number(targetPrice);
    const qty = Number(quantity);
    if (!assets.some((asset) => asset.id === assetId) || target <= 0 || qty <= 0) return;
    setRules((current) => [...current, {
      id: crypto.randomUUID(), assetId, targetPrice: target, quantity: qty,
      active: true, triggered: false, createdAt: Date.now(),
    }]);
  }, []);

  const removeRule = useCallback((id) => setRules((current) => current.filter((rule) => rule.id !== id)), []);
  const toggleRule = useCallback((id) => setRules((current) => current.map((rule) => rule.id === id ? { ...rule, active: !rule.active } : rule)), []);
  const addBuyRule = useCallback(({ assetId, targetPrice, quantity }) => {
    const target = Number(targetPrice);
    const qty = Number(quantity);
    if (!assets.some((asset) => asset.id === assetId) || target <= 0 || qty <= 0) return;
    setBuyRules((current) => [...current, {
      id: crypto.randomUUID(), assetId, targetPrice: target, quantity: qty,
      active: true, triggered: false, createdAt: Date.now(),
    }]);
  }, []);
  const removeBuyRule = useCallback((id) => setBuyRules((current) => current.filter((rule) => rule.id !== id)), []);
  const toggleBuyRule = useCallback((id) => setBuyRules((current) => current.map((rule) => rule.id === id ? { ...rule, active: !rule.active } : rule)), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setRules((current) => {
      let changed = false;
      const next = current.map((rule) => {
        if (!rule.active || rule.triggered) return rule;
        const price = prices[rule.assetId] || 0;
        if (price < rule.targetPrice) return rule;
        const owned = holdings[rule.assetId]?.quantity || 0;
        const qty = Math.min(rule.quantity, owned);
        const asset = assets.find((item) => item.id === rule.assetId);
        changed = true;
        if (qty <= 0) {
          addNotification({ assetId: rule.assetId, category: "autoSell", type: "error", title: "Auto-Sell Failed", message: `You do not own ${asset?.symbol || rule.assetId}.` });
        } else {
          sell(rule.assetId, qty, price);
          addNotification({ assetId: rule.assetId, category: "autoSell", type: "success", title: "Auto-Sell Executed", message: `Sold ${qty} ${asset?.symbol || rule.assetId} at $${price.toFixed(2)}.` });
        }
        return { ...rule, active: false, triggered: true, triggeredAt: Date.now(), executedQuantity: qty };
      });
      return changed ? next : current;
    });
  }, [prices, holdings, isAuthenticated, sell, addNotification]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setBuyRules((current) => {
      let changed = false;
      const next = current.map((rule) => {
        if (!rule.active || rule.triggered) return rule;
        const price = prices[rule.assetId] || 0;
        if (price > rule.targetPrice) return rule;
        const affordableQuantity = Math.floor((cash / price) * 100) / 100;
        const qty = Math.min(rule.quantity, affordableQuantity);
        const asset = assets.find((item) => item.id === rule.assetId);
        changed = true;
        if (qty <= 0) {
          addNotification({ assetId: rule.assetId, category: "autoBuy", type: "error", title: "Auto-Buy Failed", message: `Insufficient cash to buy ${asset?.symbol || rule.assetId}.` });
        } else {
          buy(rule.assetId, qty, price);
          addNotification({ assetId: rule.assetId, category: "autoBuy", type: "success", title: "Auto-Buy Executed", message: `Bought ${qty} ${asset?.symbol || rule.assetId} at $${price.toFixed(2)}.` });
        }
        return { ...rule, active: false, triggered: true, triggeredAt: Date.now(), executedQuantity: qty };
      });
      return changed ? next : current;
    });
  }, [prices, cash, isAuthenticated, buy, addNotification]);

  const value = useMemo(() => ({ rules, addRule, removeRule, toggleRule, buyRules, addBuyRule, removeBuyRule, toggleBuyRule }), [rules, addRule, removeRule, toggleRule, buyRules, addBuyRule, removeBuyRule, toggleBuyRule]);
  return <AutoSellContext.Provider value={value}>{children}</AutoSellContext.Provider>;
}

export function useAutoSell() {
  const context = useContext(AutoSellContext);
  if (!context) throw new Error("useAutoSell must be used inside AutoSellProvider");
  return context;
}

export function useAutoBuy() {
  const context = useContext(AutoSellContext);
  if (!context) throw new Error("useAutoBuy must be used inside AutoSellProvider");
  return {
    rules: context.buyRules,
    addRule: context.addBuyRule,
    removeRule: context.removeBuyRule,
    toggleRule: context.toggleBuyRule,
  };
}
