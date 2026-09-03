import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  return <main className="page home-page"><p className="eyebrow">PAPER TRADING PLATFORM</p><h1>Trading Simulator</h1><p className="description">Practice stocks and crypto trading with simulated cash, live-feeling prices, portfolio tracking, alerts, auto-sell and a leaderboard.</p><div className="home-actions"><Link className="button" to={isAuthenticated ? "/app/market" : "/register"}>{isAuthenticated ? "Open Trading Terminal" : "Create Account"}</Link>{!isAuthenticated && <Link className="secondary-button" to="/login">Sign In</Link>}</div><div className="feature-grid"><div className="card"><h2>Live Market</h2><p>Prices move every second through a local simulator.</p></div><div className="card"><h2>Portfolio</h2><p>Track holdings, cash, trades and real-time P&amp;L.</p></div><div className="card"><h2>Automation</h2><p>Create price alerts and automatic sell rules.</p></div></div></main>;
}
