import { Request, Response } from "express";
import { calculatePolygonArea, saveField, getSavedFields } from "../services/gis/gis.service.js";

export const calculateField = (req: Request, res: Response): void => {
  try {
    const { coordinates } = req.body;
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
      res.status(400).json({ success: false, message: "At least 3 polygon coordinates required" });
      return;
    }

    const result = calculatePolygonArea(coordinates);
    res.json({
      success: true,
      ...result,
      spectralIndices: {
        meanNdvi: 0.76,
        soilMoisture10cmPercent: 36.2,
        vegetationUniformityPercent: 89.4,
        diseaseRiskZoneCount: 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveFarmPlot = (req: Request, res: Response): void => {
  try {
    const { fieldName, coordinates, farmerId } = req.body;
    if (!coordinates || coordinates.length < 3) {
      res.status(400).json({ success: false, message: "Valid coordinates required" });
      return;
    }

    const field = saveField(fieldName, coordinates, farmerId || "farmer-demo-1");
    res.json({ success: true, field });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listFields = (req: Request, res: Response): void => {
  try {
    const farmerId = (req.query.farmerId as string) || "farmer-demo-1";
    const fields = getSavedFields(farmerId);
    res.json({ success: true, fields });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
