import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import AssetDetails from "./pages/AssetDetails";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Navigate to="/app/market" replace />} />
        <Route path="/app/market" element={<Market />} />
        <Route path="/app/portfolio" element={<Portfolio />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/asset/:id" element={<AssetDetails />} />
        <Route path="/app/leaderboard" element={<Leaderboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
