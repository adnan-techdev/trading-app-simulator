import { Router } from "express";
import { getPortfolio, syncPortfolio, resetPortfolio } from "../controllers/portfolioController.js";
import protect from "../middleware/authMiddleware.js";
const router = Router();
router.use(protect);
router.get("/", getPortfolio);
router.post("/sync", syncPortfolio);
router.post("/reset", resetPortfolio);
export default router;
