import { useMemo, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { usePriceFeed } from "../context/PriceFeedContext";

export default function TradePanel({ asset, isFavorite, onToggleFavorite }) {
  const { cash, holdings, buy, sell } = usePortfolio();
  const { getPrice } = usePriceFeed();
  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const price = getPrice(asset.id);
  const qty = Number(quantity);
  const total = useMemo(() => qty > 0 ? qty * price : 0, [qty, price]);
  const holding = holdings[asset.id]?.quantity || 0;

  const maxQty = side === "buy"
    ? Math.max(0, Math.floor((cash / price) * 100) / 100)
    : Math.max(0, Math.floor(holding * 100) / 100);

  const setMaxQty = () => setQuantity(String(maxQty));
  const setQuarterQty = () => setQuantity(String((maxQty * 0.25).toFixed(2)));
  const setHalfQty = () => setQuantity(String((maxQty * 0.5).toFixed(2)));
  const setThreeQuarterQty = () => setQuantity(String((maxQty * 0.75).toFixed(2)));

  const submit = (event) => {
    event.preventDefault();
    setError("");
    if (!qty || qty <= 0) return setError("Enter a valid quantity.");
    if (side === "buy") {
      if (total > cash) return setError("Insufficient cash for this trade.");
      buy(asset.id, qty, price);
    } else {
      if (qty > holding) return setError("You do not own enough of this asset.");
      sell(asset.id, qty, price);
    }
    setQuantity("");
  };

  return <section className="trade-panel card">
    <div className="trade-tabs"><button type="button" className={side === "buy" ? "trade-tab active" : "trade-tab"} onClick={() => { setSide("buy"); setError(""); }}>Buy</button><button type="button" className={side === "sell" ? "trade-tab active" : "trade-tab"} onClick={() => { setSide("sell"); setError(""); }}>Sell</button></div>
    <div className="trade-info"><div><span>Current Price</span><strong>${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div><div><span>Available Cash</span><strong>${cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div><div><span>Your Holdings</span><strong>{holding}</strong></div></div>
    <form onSubmit={submit} className="trade-form">
      <label htmlFor="quantity">Quantity</label>
      <div className="quantity-row">
        <input id="quantity" type="number" min="0" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" />
        <button type="button" className="secondary-button" onClick={setMaxQty}>Max</button>
      </div>
      <div className="quick-qty-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <button type="button" className="secondary-button" onClick={setQuarterQty}>25%</button>
        <button type="button" className="secondary-button" onClick={setHalfQty}>50%</button>
        <button type="button" className="secondary-button" onClick={setThreeQuarterQty}>75%</button>
        <button type="button" className="secondary-button" onClick={setMaxQty}>100%</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="trade-total" style={{ padding: "16px 18px", margin: "8px 0" }}><span>Estimated Total</span><strong>${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div>
      <button type="submit" className={`button full-width quick-trade-button ${side === "buy" ? "buy" : "sell"}`}>{side === "buy" ? `Buy ${asset.symbol}` : `Sell ${asset.symbol}`}</button>
      <button type="button" className="favorite-button" style={{ width: "100%", minHeight: "42px" }} onClick={() => onToggleFavorite(asset.id)}>{isFavorite ? "★ Favorited" : "☆ Favorite"}</button>
    </form>
  </section>;
}
