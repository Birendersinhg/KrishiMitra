import { Request, Response } from "express";
import { verifyAndGenerateRAG } from "../services/rag/guardrails.service.js";
import { AGRONOMY_CORPUS } from "../services/rag/vectorStore.service.js";

export const queryKnowledge = (req: Request, res: Response): void => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ success: false, message: "Query string is required" });
      return;
    }

    const response = verifyAndGenerateRAG(query);
    res.json({ success: true, ...response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listSources = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    sources: AGRONOMY_CORPUS.map((c) => ({
      id: c.id,
      sourceDoc: c.sourceDoc,
      publisher: c.publisher,
      chapter: c.chapterOrSection,
      cropOrDomain: c.cropOrDomain,
    })),
  });
};
