import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import AlertForm from "../components/AlertForm";
import AlertList from "../components/AlertList";
import AutoSellForm from "../components/AutoSellForm";
import AutoSellList from "../components/AutoSellList";
import AutoBuyForm from "../components/AutoBuyForm";
import AutoBuyList from "../components/AutoBuyList";

export default function Alerts() {
  return <AppLayout><PageHeader eyebrow="AUTOMATION" title="Alerts & Automation" description="React to your simulated market with alerts and automatic buy and sell rules." /><AlertForm /><section className="automation-section"><div className="section-header"><div><h2>Price Alerts</h2><p>One-time notifications when a target is reached.</p></div></div><AlertList /></section><section className="automation-section"><AutoBuyForm /><div className="section-header"><div><h2>Auto-Buy Rules</h2><p>Buy the selected quantity when the price reaches or falls below your target.</p></div></div><AutoBuyList /></section><section className="automation-section"><AutoSellForm /><div className="section-header"><div><h2>Auto-Sell Rules</h2><p>Sell the selected quantity when the price reaches or rises above your target.</p></div></div><AutoSellList /></section></AppLayout>;
}
