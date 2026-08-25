import { Router } from "express";
import { queryKnowledge, listSources } from "../controllers/rag.controller.js";

const router = Router();
router.post("/query", queryKnowledge);
router.get("/sources", listSources);

export default router;
