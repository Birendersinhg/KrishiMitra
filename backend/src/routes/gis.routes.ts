import { Router } from "express";
import { calculateField, saveFarmPlot, listFields } from "../controllers/gis.controller.js";

const router = Router();
router.post("/calculate-field", calculateField);
router.post("/save-field", saveFarmPlot);
router.get("/saved-fields", listFields);

export default router;
