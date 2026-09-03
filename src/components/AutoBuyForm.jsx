import { useState } from "react";
import assets from "../data/assets";
import { useAutoBuy } from "../context/AutoSellContext";
import { usePortfolio } from "../context/PortfolioContext";

export default function AutoBuyForm({ initialAssetId = "BTC", fixedAsset = false }) {
  const [assetId, setAssetId] = useState(initialAssetId);
  const [targetPrice, setTargetPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const { addRule } = useAutoBuy();
  const { cash } = usePortfolio();
  const selectedAsset = assets.find((asset) => asset.id === assetId);
  const maxQuantity = targetPrice ? Math.max(0, Math.floor((cash / Number(targetPrice)) * 100) / 100) : 0;
  const setQuantityPercent = (percent) => setQuantity((maxQuantity * percent).toFixed(2));

  const submit = (event) => {
    event.preventDefault();
    if (!Number(targetPrice) || !Number(quantity)) return;
    addRule({ assetId, targetPrice, quantity });
    setTargetPrice("");
    setQuantity("");
  };

  return <form className="card" onSubmit={submit}>
    <h2>Create Auto-Buy Rule</h2>
    <div className="form-grid">
      {!fixedAsset && <div className="form-field"><label>Asset</label><select value={assetId} onChange={(event) => setAssetId(event.target.value)}>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} ({asset.symbol})</option>)}</select></div>}
      <div className="form-field" style={fixedAsset ? { gridColumn: "1 / -1" } : undefined}><label>Buy Price</label><input style={{ width: "100%" }} type="number" min="0.01" step="0.01" value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} placeholder="Target price" /></div>
      <div className="form-field" style={fixedAsset ? { gridColumn: "1 / -1" } : undefined}><label>Quantity</label><div className="quantity-row"><input style={{ width: "100%" }} type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="0.25" /><button type="button" className="secondary-button" onClick={() => setQuantity(String(maxQuantity))}>Max</button></div></div>
    </div>
    <div className="quick-qty-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}><button type="button" className="secondary-button" onClick={() => setQuantityPercent(0.25)}>25%</button><button type="button" className="secondary-button" onClick={() => setQuantityPercent(0.5)}>50%</button><button type="button" className="secondary-button" onClick={() => setQuantityPercent(0.75)}>75%</button><button type="button" className="secondary-button" onClick={() => setQuantityPercent(1)}>100%</button></div>
    <div className="trade-total" style={{ margin: "14px 0", padding: "16px 18px" }}><span>Estimated Total</span><strong>${((Number(quantity) || 0) * (Number(targetPrice) || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div>
    <button className="button quick-trade-button buy" style={{ width: "100%" }} type="submit">Auto-Buy {selectedAsset?.name || "Asset"}</button>
  </form>;
}
