import { Router } from "express";
import { simulateScenario } from "../controllers/simulation.controller.js";

const router = Router();
router.post("/run", simulateScenario);

export default router;
