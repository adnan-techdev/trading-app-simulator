import mongoose from "mongoose";

const traderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  cash: { type: Number, required: true, default: 100000 },
  portfolioValue: { type: Number, required: true, default: 100000 },
  pnl: { type: Number, required: true, default: 0 },
  holdings: { type: Map, of: { quantity: Number, averagePrice: Number }, default: {} },
}, { timestamps: true });

export default mongoose.model("Trader", traderSchema);
