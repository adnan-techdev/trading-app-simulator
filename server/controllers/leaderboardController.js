import getFirestore, { serializeDocument } from "../config/firebase.js";

export async function getLeaderboard(req, res, next) {
  try {
    const snapshot = await getFirestore().collection("traders").orderBy("portfolioValue", "desc").limit(100).get();
    const traders = snapshot.docs.map(serializeDocument);
    return res.json({ leaderboard: traders.map((trader, index) => ({ rank: index + 1, userId: trader.userId, name: trader.name, portfolioValue: trader.portfolioValue, pnl: trader.pnl, updatedAt: trader.updatedAt })) });
  } catch (error) { next(error); }
}
