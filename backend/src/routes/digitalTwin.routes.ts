import { Router } from "express";
import { getTwin, updateTwin, triggerSensorPulse } from "../controllers/digitalTwin.controller.js";

const router = Router();
router.get("/", getTwin);
router.put("/", updateTwin);
router.post("/pulse", triggerSensorPulse);

export default router;
