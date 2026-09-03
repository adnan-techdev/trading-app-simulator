import { getStoredToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "API request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
}

export const register = (payload) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(payload) });

export const login = (payload) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(payload) });

export const getMe = () => request("/auth/me");
export const updateProfile = (payload) =>
  request("/auth/me", { method: "PUT", body: JSON.stringify(payload) });
export const deleteAccount = () => request("/auth/me", { method: "DELETE" });
export const getPortfolio = () => request("/portfolio");
export const resetPortfolio = () => request("/portfolio/reset", { method: "POST" });

export const syncPortfolio = (payload) =>
  request("/portfolio/sync", { method: "POST", body: JSON.stringify(payload) });

export const createTrade = (payload) =>
  request("/trades", { method: "POST", body: JSON.stringify(payload) });

export const getTrades = () => request("/trades");
export const deleteTrades = () => request("/trades", { method: "DELETE" });
export const getLeaderboard = () => request("/leaderboard");
