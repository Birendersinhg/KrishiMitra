import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { diagnoseCrop, analyzeSoil, chatAssistant } from "../services/ai/ai.service.js";
import { saveBase64Image } from "../services/storage/storage.service.js";

export const diagnose = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cropName, imageData, language } = req.body;
    if (!imageData) {
      res.status(400).json({ success: false, message: "Image data is required" });
      return;
    }

    const savedUrl = saveBase64Image(imageData);
    const diagnosis = await diagnoseCrop(cropName || "Paddy", imageData, language);

    // Look up demo user or use fallback
    let farmer = await prisma.user.findFirst({ where: { role: "FARMER" } });
    const farmerId = farmer ? farmer.id : "farmer-demo-1";

    const products = await prisma.product.findMany({
      where: {
        OR: diagnosis.productKeywords.map((k) => ({
          name: { contains: k },
        })),
      },
      take: 4,
    });

    const analysis = await prisma.cropAnalysis.create({
      data: {
        farmerId,
        cropName: cropName || "Paddy",
        imageUrl: savedUrl,
        cropHealth: diagnosis.severity === "Critical" || diagnosis.severity === "High" ? "Diseased" : "Moderate",
        disease: diagnosis.disease,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
        recommendations: JSON.stringify({
          organicTreatments: diagnosis.organicTreatments,
          chemicalTreatments: diagnosis.chemicalTreatments,
          productKeywords: diagnosis.productKeywords,
        }),
        farmerExplanation: diagnosis.advisory,
        aiResponse: JSON.stringify({ symptoms: diagnosis.symptoms }),
      },
    });

    res.json({
      success: true,
      analysis: {
        id: analysis.id,
        cropName: analysis.cropName,
        imageUrl: analysis.imageUrl,
        disease: analysis.disease,
        confidence: analysis.confidence,
        severity: analysis.severity,
        symptoms: diagnosis.symptoms,
        organicTreatments: diagnosis.organicTreatments,
        chemicalTreatments: diagnosis.chemicalTreatments,
        products: products.length > 0 ? products : await prisma.product.findMany({ take: 3 }),
        createdAt: analysis.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const soilAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageData } = req.body;
    const result = await analyzeSoil(imageData || "");
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, language, context } = req.body;
    const response = await chatAssistant(message, language, context);
    res.json({ success: true, response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const analyses = await prisma.cropAnalysis.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, analyses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalysisById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const analysis = await prisma.cropAnalysis.findUnique({ where: { id } });
    if (!analysis) {
      res.status(404).json({ success: false, message: "Analysis not found" });
      return;
    }

    let symptoms: string[] = [
      "Spindle-shaped lesions with grayish centers",
      "Yellowing margins and chlorosis",
    ];
    let organicTreatments: string[] = [
      "Apply Pseudomonas fluorescens bio-fungicide @ 10g/L",
      "Spray 5% Neem Seed Kernel Extract (NSKE)",
    ];
    let chemicalTreatments: string[] = [
      "Spray Tricyclazole 75% WP @ 0.6 g/L or Mancozeb 75% WP @ 2g/L",
      "Ensure proper field drainage and reduce nitrogen dosage",
    ];

    try {
      if (analysis.aiResponse) {
        const parsed = JSON.parse(analysis.aiResponse);
        if (parsed.symptoms) symptoms = parsed.symptoms;
      }
      if (analysis.recommendations) {
        const rec = JSON.parse(analysis.recommendations);
        if (rec.organicTreatments) organicTreatments = rec.organicTreatments;
        if (rec.chemicalTreatments) chemicalTreatments = rec.chemicalTreatments;
      }
    } catch {}

    const products = await prisma.product.findMany({ take: 3 });

    res.json({
      success: true,
      analysis: {
        id: analysis.id,
        cropName: analysis.cropName,
        imageUrl: analysis.imageUrl,
        disease: analysis.disease,
        confidence: analysis.confidence || 95,
        severity: analysis.severity,
        symptoms,
        organicTreatments,
        chemicalTreatments,
        products,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
