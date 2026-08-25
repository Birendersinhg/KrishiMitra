import { Router } from "express";
import { diagnose, soilAnalysis, chat, getHistory, getAnalysisById } from "../controllers/analysis.controller.js";

const router = Router();
router.post("/diagnose", diagnose);
router.post("/soil", soilAnalysis);
router.post("/chat", chat);
router.get("/history", getHistory);
router.get("/:id", getAnalysisById);
export default router;
