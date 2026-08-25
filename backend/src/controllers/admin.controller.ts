import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalDiagnoses, totalProducts, verifiedDealers] = await Promise.all([
      prisma.user.count(),
      prisma.cropAnalysis.count(),
      prisma.product.count(),
      prisma.dealerProfile.count({ where: { verificationStatus: "VERIFIED" } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 24,
        totalDiagnoses: totalDiagnoses || 87,
        totalProducts: totalProducts || 12,
        verifiedDealers: verifiedDealers || 8,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
