import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword, updateProfile as updateFirebaseProfile } from "firebase/auth";
import { createProfile, deleteAccount as deleteAccountRequest, getMe, updateProfile as updateProfileRequest } from "../services/api";
import { firebaseAuth } from "../firebase";
import { clearAuth, saveAuth } from "../services/auth";

const AuthContext = createContext(null);

async function tokenFor(user) {
  const token = await user.getIdToken();
  saveAuth(token, { id: user.uid, name: user.displayName || "", email: user.email });
  return token;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
    if (!firebaseUser) {
      clearAuth();
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      await tokenFor(firebaseUser);
      const data = await getMe();
      setUser(data.user);
    } catch {
      clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }), []);

  const login = useCallback(async ({ email, password }) => {
    setError("");
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await tokenFor(credential.user);
      const data = await getMe();
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setError("");
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateFirebaseProfile(credential.user, { displayName: name.trim() });
      await tokenFor(credential.user);
      const data = await createProfile({ name: name.trim() });
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
    clearAuth();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (firebaseAuth.currentUser) {
      await deleteAccountRequest();
      await deleteUser(firebaseAuth.currentUser);
    }
    clearAuth();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async ({ name, email, password, currentPassword }) => {
    const firebaseUser = firebaseAuth.currentUser;
    if (!firebaseUser) throw new Error("Authentication required.");
    if (name && name !== firebaseUser.displayName) await updateFirebaseProfile(firebaseUser, { displayName: name });
    if (password) await updatePassword(firebaseUser, password);
    const data = await updateProfileRequest({ name, email, currentPassword });
    await tokenFor(firebaseUser);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(() => ({ user, loading, error, isAuthenticated: Boolean(user), login, register, logout, deleteAccount, updateProfile }), [user, loading, error, login, register, logout, deleteAccount, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
