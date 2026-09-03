import { Router } from "express";
import { createTrade, getTrades, deleteTrades } from "../controllers/tradeController.js";
import protect from "../middleware/authMiddleware.js";
const router = Router();
router.use(protect);
router.get("/", getTrades);
router.post("/", createTrade);
router.delete("/", deleteTrades);
export default router;
