import { Request, Response } from "express";
import { runWhatIfSimulation } from "../services/simulation/whatIfEngine.service.js";

export const simulateScenario = (req: Request, res: Response): void => {
  try {
    const result = runWhatIfSimulation(req.body || {});
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
