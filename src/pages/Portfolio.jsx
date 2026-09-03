import { useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import SummaryCard from "../components/SummaryCard";
import AssetCard from "../components/AssetCard";
import { usePortfolio } from "../context/PortfolioContext";
import { usePriceFeed } from "../context/PriceFeedContext";
import assets from "../data/assets";

const INITIAL_CASH = 100000;

function tradeDate(timestamp) {
  return new Date(timestamp || Date.now()).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Portfolio() {
  const { cash, holdings, trades, resetPortfolio, hydrated, syncError } = usePortfolio();
  const { getPrice } = usePriceFeed();
  const [favorites, setFavorites] = useState([]);
  const list = Object.entries(holdings);
  const holdingsValue = useMemo(() => list.reduce((sum, [id, holding]) => sum + holding.quantity * getPrice(id), 0), [list, getPrice]);
  const totalValue = cash + holdingsValue;
  const pnl = totalValue - INITIAL_CASH;
  const toggleFavorite = (assetId) => setFavorites((current) => current.includes(assetId) ? current.filter((item) => item !== assetId) : [...current, assetId]);

  if (!hydrated) return <AppLayout><div className="loading-state">Loading portfolio...</div></AppLayout>;

  return <AppLayout>
    <PageHeader eyebrow="PORTFOLIO" title="My Portfolio" description="Cash, holdings and performance from your live simulated market." />
    {syncError && <div className="sync-warning">{syncError}</div>}
    <section className="portfolio-summary"><SummaryCard label="Cash Balance" value={`$${cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} /><SummaryCard label="Portfolio Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} /><SummaryCard label="Total P&L" value={`${pnl >= 0 ? "+" : "-"}$${Math.abs(pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} /></section>
    <section className="card">
      <div className="section-header"><div><h2>Holdings</h2><p>Current market values.</p></div><button className="secondary-button" type="button" onClick={resetPortfolio}>Reset Portfolio</button></div>
      {!list.length ? <div className="empty-state"><h3>No holdings yet</h3><p>Go to the market and make your first trade.</p></div> : <div className="market-grid">{list.map(([assetId]) => { const asset = assets.find((item) => item.id === assetId); return asset ? <AssetCard key={assetId} asset={asset} isFavorite={favorites.includes(assetId)} onToggleFavorite={toggleFavorite} /> : null; })}</div>}
    </section>
    <section className="card trades-card"><h2>Trade History</h2>{!trades.length ? <p className="muted">No trades yet.</p> : <div className="trade-history"><div className="trade-history-row" style={{ gridTemplateColumns: ".8fr .8fr 1fr 1fr 1.2fr 1.5fr", color: "#9ea6b2", fontWeight: 700 }}><span>Type</span><span>Asset</span><span>Quantity</span><span>Price</span><span>Total</span><span>Date &amp; Time</span></div>{trades.map((trade) => <div className="trade-history-row" style={{ gridTemplateColumns: ".8fr .8fr 1fr 1fr 1.2fr 1.5fr" }} key={trade.id}><strong className={trade.type === "BUY" ? "positive" : "negative"}>{trade.type}</strong><strong>{trade.assetId}</strong><span>{trade.quantity}</span><span>${trade.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span><span className={trade.type === "BUY" ? "positive" : "negative"}>${trade.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span><span>{tradeDate(trade.timestamp)}</span></div>)}</div>}</section>
  </AppLayout>;
}
