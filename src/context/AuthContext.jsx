import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { deleteAccount as deleteAccountRequest, getMe, login as loginRequest, register as registerRequest, updateProfile as updateProfileRequest } from "../services/api";
import { clearAuth, getStoredToken, getStoredUser, saveAuth } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function restore() {
      if (!getStoredToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (credentials) => {
    setError("");
    try {
      const data = await loginRequest(credentials);
      saveAuth(data.token, data.user);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError("");
    try {
      const data = await registerRequest(payload);
      saveAuth(data.token, data.user);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await deleteAccountRequest();
    clearAuth();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await updateProfileRequest(payload);
    saveAuth(getStoredToken(), data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    deleteAccount,
    updateProfile,
  }), [user, loading, error, login, register, logout, deleteAccount, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
