import { useAutoSell } from "../context/AutoSellContext";
import { usePriceFeed } from "../context/PriceFeedContext";
import assets from "../data/assets";

export default function AutoSellList({ assetId }) {
  const { rules, removeRule, toggleRule } = useAutoSell();
  const { getPrice } = usePriceFeed();
  const visibleRules = assetId ? rules.filter((rule) => rule.assetId === assetId) : rules;
  if (!visibleRules.length) return <div className="card empty-state"><h3>No auto-sell rules</h3><p>Create a rule to sell an asset automatically at a target price.</p></div>;
  return <div className="alert-list">{visibleRules.map((rule) => { const asset = assets.find((a) => a.id === rule.assetId); const price = getPrice(rule.assetId); return <div key={rule.id} className="card alert-row"><div><strong>{asset?.name || rule.assetId}</strong><span>{asset?.symbol}</span></div><div><span>Current</span><strong>${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div><div><span>Target</span><strong>${rule.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div><div><span>Quantity</span><strong>{rule.quantity}</strong></div><div><span>Status</span><strong className={rule.triggered ? "positive" : rule.active ? "live-status" : "muted"}>{rule.triggered ? "Executed" : rule.active ? "Active" : "Paused"}</strong></div><div className="alert-actions">{!rule.triggered && <button className="secondary-button" type="button" onClick={() => toggleRule(rule.id)}>{rule.active ? "Pause" : "Resume"}</button>}<button className="danger-button" type="button" onClick={() => removeRule(rule.id)}>Remove Auto-Sell {asset?.name || rule.assetId}</button></div></div>; })}</div>;
}
