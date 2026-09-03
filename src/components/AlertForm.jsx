import { useState } from "react";
import assets from "../data/assets";
import { useAlerts } from "../context/AlertContext";

export default function AlertForm() {
  const [assetId, setAssetId] = useState("BTC");
  const [condition, setCondition] = useState("above");
  const [targetPrice, setTargetPrice] = useState("");
  const { addAlert } = useAlerts();
  const submit = (e) => {
    e.preventDefault();
    const value = Number(targetPrice);
    if (!value || value <= 0) return;
    addAlert({ assetId, condition, targetPrice: value });
    setTargetPrice("");
  };
  return <form className="card" onSubmit={submit}><h2>Create Price Alert</h2><div className="form-grid"><div className="form-field"><label>Asset</label><select value={assetId} onChange={(e) => setAssetId(e.target.value)}>{assets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.symbol})</option>)}</select></div><div className="form-field"><label>Condition</label><select value={condition} onChange={(e) => setCondition(e.target.value)}><option value="above">Price is above</option><option value="below">Price is below</option></select></div><div className="form-field"><label>Target Price</label><input type="number" min="0.01" step="0.01" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="62000" /></div></div><button className="button" type="submit">Create Alert</button></form>;
}
