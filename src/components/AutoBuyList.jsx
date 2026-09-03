import { useAutoBuy } from "../context/AutoSellContext";
import { usePriceFeed } from "../context/PriceFeedContext";
import assets from "../data/assets";

export default function AutoBuyList({ assetId }) {
  const { rules, removeRule, toggleRule } = useAutoBuy();
  const { getPrice } = usePriceFeed();
  const visibleRules = assetId ? rules.filter((rule) => rule.assetId === assetId) : rules;

  if (!visibleRules.length) return <div className="card empty-state"><h3>No auto-buy rules</h3><p>Create a rule to buy an asset automatically at a target price.</p></div>;
  return <div className="alert-list">{visibleRules.map((rule) => {
    const asset = assets.find((item) => item.id === rule.assetId);
    const price = getPrice(rule.assetId);
    return <div key={rule.id} className="card alert-row">
      <div><strong>{asset?.name || rule.assetId}</strong><span>{asset?.symbol}</span></div>
      <div><span>Current</span><strong>${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div>
      <div><span>Buy at</span><strong>${rule.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div>
      <div><span>Quantity</span><strong>{rule.quantity}</strong></div>
      <div><span>Status</span><strong className={rule.triggered ? "positive" : rule.active ? "live-status" : "muted"}>{rule.triggered ? "Executed" : rule.active ? "Active" : "Paused"}</strong></div>
      <div className="alert-actions">{!rule.triggered && <button className="secondary-button" type="button" onClick={() => toggleRule(rule.id)}>{rule.active ? "Pause" : "Resume"}</button>}<button className="danger-button" type="button" onClick={() => removeRule(rule.id)}>Remove Auto-Buy {asset?.name || rule.assetId}</button></div>
    </div>;
  })}</div>;
}
