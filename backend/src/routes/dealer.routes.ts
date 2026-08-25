import { Router } from "express";
import { getDealers } from "../controllers/dealer.controller.js";

const router = Router();
router.get("/", getDealers);
export default router;
