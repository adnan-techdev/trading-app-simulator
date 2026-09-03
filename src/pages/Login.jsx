import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = "Sign In | TradeSim"; }, []);
  if (isAuthenticated) return <Navigate to="/app/market" replace />;

  async function submit(e) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try { await login({ email, password }); navigate(location.state?.from || "/app/market", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  return <main className="page centered-page"><div className="login-card"><p className="eyebrow">TRADESIM</p><h1>Welcome Back</h1><p>Sign in to your trading terminal.</p><form className="auth-form" onSubmit={submit}><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" /><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" />{error && <p className="form-error">{error}</p>}<button className="button full-width" disabled={submitting}>{submitting ? "Signing in..." : "Sign In"}</button></form><p className="auth-footer">No account? <Link to="/register">Create one</Link></p><Link className="back-link" to="/">← Back to home</Link></div></main>;
}
