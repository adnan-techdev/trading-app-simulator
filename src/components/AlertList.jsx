import { useAlerts } from "../context/AlertContext";
import { usePriceFeed } from "../context/PriceFeedContext";
import assets from "../data/assets";

export default function AlertList() {
  const { alerts, removeAlert, toggleAlert } = useAlerts();
  const { getPrice } = usePriceFeed();
  if (!alerts.length) return <div className="card empty-state"><h3>No price alerts</h3><p>Create an alert to get notified when an asset reaches a target.</p></div>;
  return <div className="alert-list">{alerts.map((alert) => { const asset = assets.find((a) => a.id === alert.assetId); const price = getPrice(alert.assetId); return <div key={alert.id} className="card alert-row"><div><strong>{asset?.name || alert.assetId}</strong><span>{asset?.symbol}</span></div><div><span>Current</span><strong>${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div><div><span>Condition</span><strong>{alert.condition === "above" ? "Above" : "Below"}</strong></div><div><span>Target</span><strong>${alert.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div><div><span>Status</span><strong className={alert.triggered ? "positive" : alert.active ? "live-status" : "muted"}>{alert.triggered ? "Triggered" : alert.active ? "Active" : "Paused"}</strong></div><div className="alert-actions">{!alert.triggered && <button className="secondary-button" type="button" onClick={() => toggleAlert(alert.id)}>{alert.active ? "Pause" : "Resume"}</button>}<button className="danger-button" type="button" onClick={() => removeAlert(alert.id)}>Delete</button></div></div>; })}</div>;
}
