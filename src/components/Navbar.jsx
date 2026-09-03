import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";
import NotificationCenter from "./NotificationCenter";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const { cash } = usePortfolio();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  return <header className="navbar">
    <button type="button" data-sidebar-toggle aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"} onClick={onToggleSidebar} style={{ width: "38px", height: "38px", padding: 0, border: "1px solid #303641", borderRadius: "8px", background: "#171a20", color: "#fff", fontSize: "21px", lineHeight: 1 }}>{sidebarOpen ? "×" : "☰"}</button>
    <Link to="/app/market" className="logo">TradeSim</Link>
    <nav>
      <Link to="/app/market">Market</Link>
      <Link to="/app/portfolio">Portfolio</Link>
      <Link to="/app/leaderboard">Leaderboard</Link>
    </nav>
    <div className="user-menu">
      <div className="navbar-cash" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "12px", color: "#9ea6b2" }}><span>Cash</span><strong style={{ color: "#ffffff" }}>${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
      <div className="user-info" style={{ textAlign: "left" }}><strong>{user?.name}</strong><span>{user?.email}</span></div>
      <button type="button" className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
    <NotificationCenter />
  </header>;
}
