import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import PriceChart from "../components/PriceChart";
import TradePanel from "../components/TradePanel";
import AutoBuyForm from "../components/AutoBuyForm";
import AutoSellForm from "../components/AutoSellForm";
import AutoBuyList from "../components/AutoBuyList";
import AutoSellList from "../components/AutoSellList";
import { usePriceFeed } from "../context/PriceFeedContext";
import assets from "../data/assets";

export default function AssetDetails() {
  const { id } = useParams();
  const asset = assets.find((item) => item.id === id);
  const [isFavorite, setIsFavorite] = useState(false);
  const [automationSide, setAutomationSide] = useState("buy");
  const { getPrice, history } = usePriceFeed();
  if (!asset) return <AppLayout><h1>Asset Not Found</h1><Link to="/app/market">← Back to Market</Link></AppLayout>;
  const price = getPrice(asset.id);
  const candles = history[asset.id] ?? [];
  const chartStartPrice = candles[0]?.close ?? asset.price;
  const priceDifference = price - chartStartPrice;
  const percentageChange = chartStartPrice ? (priceDifference / chartStartPrice) * 100 : 0;
  const isIncreasing = candles[candles.length - 1]?.close >= chartStartPrice;
  const movementClass = isIncreasing ? "positive" : "negative";
  return <AppLayout><Link to="/app/market">← Back to Market</Link><PageHeader eyebrow={asset.type} title={`${asset.name} (${asset.symbol})`} description="Watch the simulated live price and place a trade." /><section className="asset-detail-grid" style={{ gridTemplateColumns: "1fr" }}><div className="card"><p>Current Price</p><h2 className="live-price">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2><div className={`detail-price-movement ${movementClass}`}>{priceDifference >= 0 ? "+" : "-"}${Math.abs(priceDifference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div><div className={`detail-percentage-movement ${movementClass}`}>({percentageChange >= 0 ? "+" : "-"}{Math.abs(percentageChange).toFixed(2)}%)</div><span className="live-indicator">● Live</span></div></section><section className="asset-trading-layout asset-detail-trading-layout" style={{ gridTemplateColumns: "1fr" }}><div className="card chart-panel"><h2>Price Chart</h2><PriceChart assetId={asset.id} height={400} /></div><TradePanel asset={asset} isFavorite={isFavorite} onToggleFavorite={() => setIsFavorite((current) => !current)} /></section><section className="automation-section"><div className="section-header"><div><h2>Automate {asset.name}</h2><p>Create automatic buy and sell rules for this asset.</p></div></div><div className="trade-tabs"><button type="button" className={automationSide === "buy" ? "trade-tab active" : "trade-tab"} onClick={() => setAutomationSide("buy")}>Auto-Buy</button><button type="button" className={automationSide === "sell" ? "trade-tab active" : "trade-tab"} onClick={() => setAutomationSide("sell")}>Auto-Sell</button></div>{automationSide === "buy" ? <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}><AutoBuyForm initialAssetId={asset.id} fixedAsset /><AutoBuyList assetId={asset.id} /></div> : <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}><AutoSellForm initialAssetId={asset.id} fixedAsset /><AutoSellList assetId={asset.id} /></div>}</section></AppLayout>;
}
