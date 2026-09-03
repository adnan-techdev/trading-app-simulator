import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  clientTradeId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["BUY", "SELL"], required: true },
  assetId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
}, { timestamps: true });

tradeSchema.index({ userId: 1, clientTradeId: 1 }, { unique: true });

export default mongoose.model("Trade", tradeSchema);
