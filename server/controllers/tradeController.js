import getFirestore, { serializeDocument, serverTimestamp } from "../config/firebase.js";

export async function createTrade(req, res, next) {
  try {
    const { clientTradeId, type, assetId, quantity, price, total } = req.body;
    if (!clientTradeId || !assetId) return res.status(400).json({ message: "clientTradeId and assetId are required." });
    if (!['BUY', 'SELL'].includes(type)) return res.status(400).json({ message: "Trade type must be BUY or SELL." });
    if (Number(quantity) <= 0 || Number(price) <= 0 || Number(total) <= 0) return res.status(400).json({ message: "Invalid trade information." });
    const db = getFirestore();
    const existing = await db.collection("trades").where("userId", "==", req.user.id).where("clientTradeId", "==", clientTradeId).limit(1).get();
    const tradeRef = existing.empty ? db.collection("trades").doc() : existing.docs[0].ref;
    await tradeRef.set({ userId: req.user.id, clientTradeId, type, assetId, quantity: Number(quantity), price: Number(price), total: Number(total), createdAt: existing.empty ? serverTimestamp() : existing.docs[0].data().createdAt, updatedAt: serverTimestamp() }, { merge: true });
    const trade = serializeDocument(await tradeRef.get());
    return res.status(201).json({ trade });
  } catch (error) { next(error); }
}

export async function deleteTrades(req, res, next) {
  try {
    const db = getFirestore();
    const trades = await db.collection("trades").where("userId", "==", req.user.id).get();
    const batch = db.batch();
    trades.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return res.json({ message: "Trades deleted." });
  } catch (error) { next(error); }
}

export async function getTrades(req, res, next) {
  try {
    const snapshot = await getFirestore().collection("trades").where("userId", "==", req.user.id).get();
    const trades = snapshot.docs.map(serializeDocument).sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)));
    return res.json({ trades });
  } catch (error) { next(error); }
}
