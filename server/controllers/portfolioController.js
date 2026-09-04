import getFirestore, { serializeDocument, serverTimestamp } from "../config/firebase.js";

export async function syncPortfolio(req, res, next) {
  try {
    const { name, cash, portfolioValue, pnl, holdings } = req.body;
    const db = getFirestore();
    const traderRef = db.collection("traders").doc(req.user.id);
    await traderRef.set({ userId: req.user.id, name: name?.trim() || "Trader", cash: Number(cash) || 0, portfolioValue: Number(portfolioValue) || 0, pnl: Number(pnl) || 0, holdings: holdings || {}, updatedAt: serverTimestamp() }, { merge: true });
    const trader = serializeDocument(await traderRef.get());
    return res.json({ trader });
  } catch (error) { next(error); }
}

export async function getPortfolio(req, res, next) {
  try {
    const traderSnapshot = await getFirestore().collection("traders").doc(req.user.id).get();
    if (!traderSnapshot.exists) return res.status(404).json({ message: "Portfolio not found." });
    const trader = serializeDocument(traderSnapshot);
    return res.json({ trader });
  } catch (error) { next(error); }
}

export async function resetPortfolio(req, res, next) {
  try {
    const db = getFirestore();
    const traderRef = db.collection("traders").doc(req.user.id);
    await traderRef.set({ userId: req.user.id, name: req.body?.name?.trim() || "Trader", cash: 100000, portfolioValue: 100000, pnl: 0, holdings: {}, updatedAt: serverTimestamp() }, { merge: true });
    const trader = serializeDocument(await traderRef.get());
    return res.json({ trader });
  } catch (error) { next(error); }
}
