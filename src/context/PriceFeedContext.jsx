import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import assets from "../data/assets";
import { useNotifications } from "./NotificationContext";

const TICK_MS = 1000;
const MAX_MOVE = 0.008;
const HISTORY_LENGTH = 40;
const PriceFeedContext = createContext(null);

function createInitialPrices() {
  return Object.fromEntries(assets.map((asset) => [asset.id, asset.price]));
}

function createInitialHistory() {
  return Object.fromEntries(assets.map((asset) => [asset.id, Array.from({ length: HISTORY_LENGTH }, (_, index) => ({
    time: index,
    open: asset.price,
    close: asset.price * (1 + ((index / HISTORY_LENGTH) - 0.5) * 0.04),
    high: asset.price * (1 + 0.012 + (index % 5) * 0.003),
    low: asset.price * (1 - 0.012 - (index % 3) * 0.002),
  }))]));
}

function nextPrice(currentPrice) {
  const move = (Math.random() * 2 - 1) * MAX_MOVE;
  return Math.max(0.01, currentPrice * (1 + move));
}

export function PriceFeedProvider({ children }) {
  const [prices, setPrices] = useState(createInitialPrices);
  const [history, setHistory] = useState(createInitialHistory);
  const { addNotification } = useNotifications();
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setPrices((current) => {
        const next = {};
        const nextHistory = {};

        for (const [assetId, currentPrice] of Object.entries(current)) {
          const newPrice = nextPrice(currentPrice);
          next[assetId] = newPrice;
          const asset = assets.find((item) => item.id === assetId);
          const priceDirection = newPrice >= currentPrice ? "priceUp" : "priceDown";
          addNotification({ assetId, category: priceDirection, type: newPrice >= currentPrice ? "success" : "error", title: `${asset?.symbol || assetId} Price ${newPrice >= currentPrice ? "Up" : "Down"}`, message: `${asset?.symbol || assetId} moved to $${newPrice.toFixed(2)}.` });

          const existing = history[assetId] ?? [];
          const previous = existing[existing.length - 1] ?? { open: currentPrice, close: currentPrice, high: currentPrice, low: currentPrice };
          const candle = {
            time: Date.now(),
            open: previous.close,
            close: newPrice,
            high: Math.max(previous.close, newPrice) * (1 + Math.random() * 0.008),
            low: Math.min(previous.close, newPrice) * (1 - Math.random() * 0.008),
          };
          nextHistory[assetId] = [...existing.slice(-HISTORY_LENGTH + 1), candle];
        }

        setHistory((currentHistory) => ({ ...currentHistory, ...nextHistory }));
        return next;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [history, addNotification]);

  const getPrice = useCallback((assetId) => prices[assetId] ?? 0, [prices]);
  const value = useMemo(() => ({ prices, history, getPrice }), [prices, history, getPrice]);

  return <PriceFeedContext.Provider value={value}>{children}</PriceFeedContext.Provider>;
}

export function usePriceFeed() {
  const context = useContext(PriceFeedContext);
  if (!context) throw new Error("usePriceFeed must be used inside PriceFeedProvider");
  return context;
}
