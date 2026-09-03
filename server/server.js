import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "TradeSim API is running." }));
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
await connectDB();
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
