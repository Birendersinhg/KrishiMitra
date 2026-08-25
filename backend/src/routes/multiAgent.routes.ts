import { Router } from "express";
import { getPresets, deliberate } from "../controllers/multiAgent.controller.js";

const router = Router();
router.get("/presets", getPresets);
router.post("/deliberate", deliberate);

export default router;
