import { forwardRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";

const Sidebar = forwardRef(function Sidebar({ open, onClose }, ref) {
  const { user, logout, deleteAccount } = useAuth();
  const { cash, resetPortfolio } = usePortfolio();
  const navigate = useNavigate();
  const location = useLocation();
  const links = [
    ["/app/market", "📈", "Market"],
    ["/app/portfolio", "💼", "Portfolio"],
    ["/app/leaderboard", "🏆", "Leaderboard"],
  ];
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  const handleDeleteAccount = async () => { if (!window.confirm("Delete your account and all portfolio data?")) return; await deleteAccount(); navigate("/login", { replace: true }); };
  const handleResetPortfolio = async () => { if (window.confirm("Reset your portfolio and delete all trades?")) await resetPortfolio(); };
  return <aside ref={ref} className="sidebar" style={{ display: "flex", width: open ? "230px" : 0, minWidth: open ? "230px" : 0, overflow: "hidden", transition: "width .22s ease, min-width .22s ease, padding .22s ease", paddingLeft: open ? "18px" : 0, paddingRight: open ? "18px" : 0 }}>
    <div className="sidebar-identity" style={{ position: "relative" }}><button type="button" aria-label="Close sidebar" onClick={onClose} style={{ position: "absolute", top: 0, right: 0, width: "30px", height: "30px", padding: 0, border: "1px solid #303641", borderRadius: "7px", background: "#171a20", color: "#fff", fontSize: "18px", lineHeight: 1 }}>×</button><strong style={{ fontSize: "20px", fontWeight: 900 }}>TradeSim</strong><strong className="sidebar-user" style={{ display: "block", margin: "16px 0 0", color: "#fff" }}>{user?.name}</strong><span className="sidebar-email" style={{ display: "block", marginTop: "5px" }}>{user?.email}</span></div>
    <p className="sidebar-cash">Cash: <strong>${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
    <nav className="sidebar-nav">{links.map(([to, icon, label]) => <Link className={location.pathname === to ? "active" : ""} key={to} to={to}>{icon} {label}</Link>)}</nav>
    <div className="sidebar-actions"><button type="button" className="secondary-button" onClick={() => navigate("/app/profile")}>Update Profile</button><button type="button" className="secondary-button" onClick={handleResetPortfolio}>Reset Portfolio</button><button type="button" className="danger-button" onClick={handleDeleteAccount}>Delete Account</button><button type="button" className="logout-button" onClick={handleLogout}>Logout</button></div>
  </aside>;
});

export default Sidebar;
