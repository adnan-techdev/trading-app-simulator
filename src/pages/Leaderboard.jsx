import { useCallback, useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { getLeaderboard } from "../services/api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await getLeaderboard();
      setRows(data.leaderboard || []);
    } catch (err) {
      setError(err.message || "Could not load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [load]);

  return <AppLayout><PageHeader eyebrow="COMPETITION" title="Leaderboard" description="Rankings calculated from portfolio values stored by the backend." /><div className="card">{loading ? <div className="loading-state">Loading leaderboard...</div> : error ? <div className="empty-state"><h3>Unable to load leaderboard</h3><p>{error}</p><button className="button" onClick={load}>Try Again</button></div> : !rows.length ? <div className="empty-state"><h3>No traders yet</h3><p>Once users sync a portfolio, they will appear here.</p></div> : <table className="leaderboard"><thead><tr><th>Rank</th><th>Trader</th><th>Portfolio</th><th>P&amp;L</th></tr></thead><tbody>{rows.map((row) => <tr key={row.userId}><td>#{row.rank}</td><td>{row.name}</td><td>${Number(row.portfolioValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td><td className={row.pnl >= 0 ? "positive" : "negative"}>{row.pnl >= 0 ? "+" : "-"}${Math.abs(Number(row.pnl)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>)}</tbody></table>}</div></AppLayout>;
}
