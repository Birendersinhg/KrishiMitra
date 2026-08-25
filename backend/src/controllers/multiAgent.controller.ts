import { Request, Response } from "express";
import { runMultiAgentDeliberation, PRESET_DILEMMAS } from "../services/multiagent/agentOrchestrator.service.js";

export const getPresets = (_req: Request, res: Response): void => {
  res.json({ success: true, presets: PRESET_DILEMMAS });
};

export const deliberate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dilemma, cropName, district } = req.body;
    const deliberation = await runMultiAgentDeliberation(dilemma, cropName || "Paddy", district || "Cuttack");
    res.json({ success: true, ...deliberation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
