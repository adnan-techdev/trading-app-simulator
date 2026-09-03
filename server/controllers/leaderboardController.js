import Trader from "../models/Trader.js";

export async function getLeaderboard(req, res, next) {
  try {
    const traders = await Trader.find({}).sort({ portfolioValue: -1 }).limit(100).select("userId name portfolioValue pnl updatedAt");
    return res.json({ leaderboard: traders.map((trader, index) => ({ rank: index + 1, userId: trader.userId.toString(), name: trader.name, portfolioValue: trader.portfolioValue, pnl: trader.pnl, updatedAt: trader.updatedAt })) });
  } catch (error) { next(error); }
}
