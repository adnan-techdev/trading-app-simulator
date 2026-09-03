import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createTrade, deleteTrades, getPortfolio, getTrades, resetPortfolio as resetPortfolioRequest, syncPortfolio } from "../services/api";
import { useAuth } from "./AuthContext";
import { usePriceFeed } from "./PriceFeedContext";
import { useNotifications } from "./NotificationContext";

const INITIAL_CASH = 100000;
const STORAGE_PREFIX = "tradesim-portfolio-";
const PortfolioContext = createContext(null);

function emptyState() {
  return { cash: INITIAL_CASH, holdings: {}, trades: [] };
}

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE": return action.payload;
    case "BUY": {
      const { assetId, quantity, price } = action.payload;
      const cost = quantity * price;
      if (quantity <= 0 || cost > state.cash) return state;
      const old = state.holdings[assetId];
      const oldQty = old?.quantity || 0;
      const oldAvg = old?.averagePrice || 0;
      const newQty = oldQty + quantity;
      const newAvg = ((oldQty * oldAvg) + (quantity * price)) / newQty;
      const trade = { id: crypto.randomUUID(), type: "BUY", assetId, quantity, price, total: cost, timestamp: Date.now(), synced: false };
      return {
        cash: state.cash - cost,
        holdings: { ...state.holdings, [assetId]: { quantity: newQty, averagePrice: newAvg } },
        trades: [trade, ...state.trades],
      };
    }
    case "SELL": {
      const { assetId, quantity, price } = action.payload;
      const old = state.holdings[assetId];
      const currentQty = old?.quantity || 0;
      if (quantity <= 0 || quantity > currentQty) return state;
      const revenue = quantity * price;
      const remaining = currentQty - quantity;
      const holdings = { ...state.holdings };
      if (remaining <= 1e-10) delete holdings[assetId];
      else holdings[assetId] = { ...old, quantity: remaining };
      const trade = { id: crypto.randomUUID(), type: "SELL", assetId, quantity, price, total: revenue, timestamp: Date.now(), synced: false };
      return { cash: state.cash + revenue, holdings, trades: [trade, ...state.trades] };
    }
    case "MARK_TRADE_SYNCED":
      return { ...state, trades: state.trades.map((trade) => trade.id === action.payload ? { ...trade, synced: true } : trade) };
    case "RESET": return emptyState();
    default: return state;
  }
}

function normalizeServerTrader(trader) {
  const holdings = trader?.holdings && typeof trader.holdings === "object"
    ? Object.fromEntries(Object.entries(trader.holdings).map(([id, value]) => [id, {
        quantity: Number(value.quantity) || 0,
        averagePrice: Number(value.averagePrice) || 0,
      }]))
    : {};
  return { cash: Number(trader?.cash) || INITIAL_CASH, holdings, trades: [] };
}

function loadLocal(key) {
  if (!key) return emptyState();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      cash: typeof parsed.cash === "number" ? parsed.cash : INITIAL_CASH,
      holdings: parsed.holdings && typeof parsed.holdings === "object" ? parsed.holdings : {},
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
    };
  } catch {
    return emptyState();
  }
}

export function PortfolioProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { prices } = usePriceFeed();
  const { addNotification } = useNotifications();
  const [state, dispatch] = useReducer(reducer, undefined, emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [syncError, setSyncError] = useState("");

  const storageKey = user?.id ? `${STORAGE_PREFIX}${user.id}` : null;
  const stateRef = useRef(state);
  const pricesRef = useRef(prices);
  const userRef = useRef(user);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { pricesRef.current = prices; }, [prices]);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      setHydrated(false);
      setSyncError("");
      if (!isAuthenticated || !storageKey) {
        dispatch({ type: "HYDRATE", payload: emptyState() });
        setHydrated(true);
        return;
      }
      const local = loadLocal(storageKey);
      dispatch({ type: "HYDRATE", payload: local });
      try {
        const [portfolioResult, tradesResult] = await Promise.allSettled([getPortfolio(), getTrades()]);
        const portfolioData = portfolioResult.status === "fulfilled" ? portfolioResult.value : null;
        const tradesData = tradesResult.status === "fulfilled" ? tradesResult.value : null;
        if (!cancelled && portfolioData?.trader) {
          const serverTrades = Array.isArray(tradesData?.trades) ? tradesData.trades.map((trade) => ({
            id: trade.clientTradeId || trade._id, type: trade.type, assetId: trade.assetId, quantity: Number(trade.quantity), price: Number(trade.price), total: Number(trade.total), timestamp: new Date(trade.createdAt || Date.now()).getTime(), synced: true,
          })) : [];
          const trades = serverTrades.length ? serverTrades : local.trades;
          dispatch({ type: "HYDRATE", payload: { ...normalizeServerTrader(portfolioData.trader), trades } });
        }
        if (!cancelled && portfolioResult.status === "rejected" && portfolioResult.reason?.status !== 404) {
          setSyncError("Could not load the server portfolio; using local data.");
        }
      } catch (error) {
        if (!cancelled && error.status !== 404) setSyncError("Could not load your server portfolio; using local data.");
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }
    hydrate();
    return () => { cancelled = true; };
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    if (!hydrated || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Portfolio local save failed", error);
    }
  }, [state, hydrated, storageKey]);

  const syncSnapshot = useCallback(async () => {
    if (!hydrated || !isAuthenticated || !storageKey) return;
    const currentState = stateRef.current;
    const currentPrices = pricesRef.current;
    const currentUser = userRef.current;
    const holdingsValue = Object.entries(currentState.holdings).reduce((sum, [assetId, holding]) => sum + holding.quantity * (currentPrices[assetId] || 0), 0);
    const portfolioValue = currentState.cash + holdingsValue;
    const pnl = portfolioValue - INITIAL_CASH;
    try {
      setSyncError("");
      await syncPortfolio({
        name: currentUser?.name || "Trader",
        cash: currentState.cash,
        portfolioValue,
        pnl,
        holdings: currentState.holdings,
      });
      const unsynced = stateRef.current.trades.filter((trade) => !trade.synced);
      for (const trade of unsynced) {
        await createTrade({
          clientTradeId: trade.id,
          type: trade.type,
          assetId: trade.assetId,
          quantity: trade.quantity,
          price: trade.price,
          total: trade.total,
        });
        dispatch({ type: "MARK_TRADE_SYNCED", payload: trade.id });
      }
    } catch (error) {
      console.error("Server sync failed", error);
      setSyncError("Server sync failed. Your local portfolio is still available.");
    }
  }, [hydrated, isAuthenticated, storageKey]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return undefined;
    const timer = window.setTimeout(syncSnapshot, 750);
    return () => window.clearTimeout(timer);
  }, [state.cash, state.holdings, state.trades.length, hydrated, isAuthenticated, syncSnapshot]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return undefined;
    const interval = window.setInterval(syncSnapshot, 10000);
    return () => window.clearInterval(interval);
  }, [hydrated, isAuthenticated, syncSnapshot]);

  const buy = useCallback((assetId, quantity, price) => {
    dispatch({ type: "BUY", payload: { assetId, quantity, price } });
    addNotification({ assetId, category: "buy", type: "success", title: "Buy Executed", message: `Bought ${quantity} ${assetId} at $${price.toFixed(2)}.` });
  }, [addNotification]);

  const sell = useCallback((assetId, quantity, price) => {
    dispatch({ type: "SELL", payload: { assetId, quantity, price } });
    addNotification({ assetId, category: "sell", type: "success", title: "Sell Executed", message: `Sold ${quantity} ${assetId} at $${price.toFixed(2)}.` });
  }, [addNotification]);

  const resetPortfolio = useCallback(async () => {
    dispatch({ type: "RESET" });
    if (!isAuthenticated) return;
    try {
      await deleteTrades();
      await resetPortfolioRequest({ name: user?.name || "Trader" });
    } catch (error) {
      console.error("Server portfolio reset failed", error);
      setSyncError("Portfolio reset locally, but server reset failed.");
    }
  }, [isAuthenticated, user?.name]);

  const value = useMemo(() => ({ ...state, buy, sell, resetPortfolio, hydrated, syncError }), [state, buy, sell, resetPortfolio, hydrated, syncError]);

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return context;
}
