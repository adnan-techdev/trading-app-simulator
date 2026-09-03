import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", currentPassword: "", password: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "Profile | TradeSim"; }, []);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) {
        payload.password = form.password;
        payload.currentPassword = form.currentPassword;
      }
      const updatedUser = await updateProfile(payload);
      setForm({ name: updatedUser.name, email: updatedUser.email, currentPassword: "", password: "" });
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return <AppLayout><PageHeader eyebrow="ACCOUNT" title="Update Profile" description="Manage your account details and password." /><section className="profile-page card"><form className="profile-page-form" onSubmit={submit}><div className="form-field"><label htmlFor="profile-page-name">Name</label><input id="profile-page-name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required /></div><div className="form-field"><label htmlFor="profile-page-email">Email</label><input id="profile-page-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required /></div><div className="form-field"><label htmlFor="profile-page-current-password">Current Password</label><input id="profile-page-current-password" type="password" value={form.currentPassword} onChange={(event) => updateField("currentPassword", event.target.value)} placeholder="Only for password change" /></div><div className="form-field"><label htmlFor="profile-page-password">New Password</label><input id="profile-page-password" type="password" minLength="6" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="Leave blank to keep" /></div>{error && <p className="form-error">{error}</p>}{saved && <p className="profile-success">Profile updated.</p>}<div className="profile-page-actions"><button type="submit" className="button" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button><button type="button" className="secondary-button" onClick={() => navigate(-1)}>Cancel</button></div></form></section></AppLayout>;
}
