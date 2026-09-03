import Trade from "../models/Trade.js";

export async function createTrade(req, res, next) {
  try {
    const { clientTradeId, type, assetId, quantity, price, total } = req.body;
    if (!clientTradeId || !assetId) return res.status(400).json({ message: "clientTradeId and assetId are required." });
    if (!['BUY', 'SELL'].includes(type)) return res.status(400).json({ message: "Trade type must be BUY or SELL." });
    if (Number(quantity) <= 0 || Number(price) <= 0 || Number(total) <= 0) return res.status(400).json({ message: "Invalid trade information." });
    const trade = await Trade.findOneAndUpdate(
      { userId: req.user.id, clientTradeId },
      { userId: req.user.id, clientTradeId, type, assetId, quantity: Number(quantity), price: Number(price), total: Number(total) },
      { new: true, upsert: true, runValidators: true },
    );
    return res.status(201).json({ trade });
  } catch (error) { next(error); }
}

export async function deleteTrades(req, res, next) {
  try {
    await Trade.deleteMany({ userId: req.user.id });
    return res.json({ message: "Trades deleted." });
  } catch (error) { next(error); }
}

export async function getTrades(req, res, next) {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ trades });
  } catch (error) { next(error); }
}
