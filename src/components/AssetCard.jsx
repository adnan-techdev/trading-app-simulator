import { useState } from "react";
import { Link } from "react-router-dom";
import PriceChart from "./PriceChart";
import { usePortfolio } from "../context/PortfolioContext";
import { usePriceFeed } from "../context/PriceFeedContext";

function money(value) {
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function signedMoney(value) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(Number(value)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AssetCard({ asset, isFavorite, onToggleFavorite }) {
  const { cash, holdings, buy, sell } = usePortfolio();
  const { getPrice, history } = usePriceFeed();
  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const livePrice = getPrice(asset.id);
  const price = Number.isFinite(livePrice) && livePrice > 0 ? livePrice : asset.price;
  const holding = holdings[asset.id]?.quantity || 0;
  const chartCandles = history[asset.id] ?? [];
  const chartStartPrice = chartCandles[0]?.close ?? asset.price;
  const chartEndPrice = chartCandles[chartCandles.length - 1]?.close ?? price;
  const isPriceIncreasing = chartEndPrice >= chartStartPrice;
  const priceDifference = price - chartStartPrice;
  const priceChange = chartStartPrice ? ((price - chartStartPrice) / chartStartPrice) * 100 : 0;
  const maxQty = side === "buy"
    ? Math.max(0, Math.floor((cash / price) * 100) / 100)
    : Math.max(0, Math.floor(holding * 100) / 100);

  const handleMax = () => setQuantity(String(maxQty));

  const handleTrade = () => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;

    if (side === "buy") {
      if (qty * price > cash) return;
      buy(asset.id, qty, price);
    } else {
      if (qty > holding) return;
      sell(asset.id, qty, price);
    }

    setQuantity("");
  };

  return <div className="asset-card">
    <div className="asset-card-identity">
      <div className="asset-card-top">
        <Link to={`/app/asset/${asset.id}`}>
          <div><h2>{asset.name}</h2><p>{asset.symbol}</p></div>
        </Link>
      </div>
      <div className="asset-held">Held: <strong>{holding}</strong></div>
    </div>

    <div className="asset-card-price" style={{ display: "flex", visibility: "visible", opacity: 1 }}>
      <strong className={isPriceIncreasing ? "positive" : "negative"}>{money(price)}</strong>
      <span className={isPriceIncreasing ? "price-change positive" : "price-change negative"}>{signedMoney(priceDifference)} ({priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%)</span>
    </div>

    <div className="asset-chart-wrap"><PriceChart assetId={asset.id} compact height={52} /></div>

    <div className="asset-trade-box">
      <div className="side-toggle">
        <button type="button" className={side === "buy" ? "trade-side active" : "trade-side"} onClick={() => setSide("buy")}>Buy</button>
        <button type="button" className={side === "sell" ? "trade-side active" : "trade-side"} onClick={() => setSide("sell")}>Sell</button>
      </div>
      <div className="trade-input-row">
        <input type="number" min="0" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" />
        <button type="button" className="secondary-button" onClick={handleMax}>Max</button>
      </div>
      <button type="button" className={side === "buy" ? "button quick-trade-button buy" : "button quick-trade-button sell"} onClick={handleTrade}>{side === "buy" ? "Buy" : "Sell"}</button>
      <button type="button" className="favorite-button" onClick={() => onToggleFavorite(asset.id)}>{isFavorite ? "★ Favorited" : "☆ Favorite"}</button>
    </div>
  </div>;
}
