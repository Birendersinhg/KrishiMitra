import { Request, Response } from "express";
import { getDigitalTwin, updateDigitalTwin, simulateSensorPulse } from "../services/digitalTwin/digitalTwin.service.js";

export const getTwin = (req: Request, res: Response): void => {
  try {
    const farmerId = (req.query.farmerId as string) || "farmer-demo-1";
    const data = getDigitalTwin(farmerId);
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTwin = (req: Request, res: Response): void => {
  try {
    const farmerId = (req.body.farmerId as string) || "farmer-demo-1";
    const updated = updateDigitalTwin(farmerId, req.body.updates || {});
    res.json({ success: true, state: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerSensorPulse = (req: Request, res: Response): void => {
  try {
    const farmerId = (req.body.farmerId as string) || "farmer-demo-1";
    const pulseResult = simulateSensorPulse(farmerId);
    res.json({ success: true, ...pulseResult });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
