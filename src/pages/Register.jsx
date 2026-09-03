import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (isAuthenticated) return <Navigate to="/app/market" replace />;
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(e) {
    e.preventDefault(); setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try { await register({ name: form.name, email: form.email, password: form.password }); navigate("/app/market", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }
  return <main className="page centered-page"><div className="login-card"><p className="eyebrow">TRADESIM</p><h1>Create Account</h1><p>Start with $100,000 in simulated cash.</p><form className="auth-form" onSubmit={submit}><label>Name</label><input value={form.name} onChange={(e) => change("name", e.target.value)} required placeholder="Your name" /><label>Email</label><input type="email" value={form.email} onChange={(e) => change("email", e.target.value)} required placeholder="you@example.com" /><label>Password</label><input type="password" value={form.password} onChange={(e) => change("password", e.target.value)} required placeholder="Minimum 6 characters" /><label>Confirm Password</label><input type="password" value={form.confirmPassword} onChange={(e) => change("confirmPassword", e.target.value)} required placeholder="Repeat password" />{error && <p className="form-error">{error}</p>}<button className="button full-width" disabled={submitting}>{submitting ? "Creating account..." : "Create Account"}</button></form><p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p><Link className="back-link" to="/">← Back to home</Link></div></main>;
}
