import Trader from "../models/Trader.js";

export async function syncPortfolio(req, res, next) {
  try {
    const { name, cash, portfolioValue, pnl, holdings } = req.body;
    const trader = await Trader.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, name: name?.trim() || "Trader", cash: Number(cash) || 0, portfolioValue: Number(portfolioValue) || 0, pnl: Number(pnl) || 0, holdings: holdings || {} },
      { new: true, upsert: true, runValidators: true },
    );
    return res.json({ trader });
  } catch (error) { next(error); }
}

export async function getPortfolio(req, res, next) {
  try {
    const trader = await Trader.findOne({ userId: req.user.id });
    if (!trader) return res.status(404).json({ message: "Portfolio not found." });
    return res.json({ trader });
  } catch (error) { next(error); }
}

export async function resetPortfolio(req, res, next) {
  try {
    const trader = await Trader.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, name: req.body?.name?.trim() || "Trader", cash: 100000, portfolioValue: 100000, pnl: 0, holdings: {} },
      { new: true, upsert: true, runValidators: true },
    );
    return res.json({ trader });
  } catch (error) { next(error); }
}
