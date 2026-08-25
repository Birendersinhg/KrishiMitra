import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";

export const getDealers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { district } = req.query;
    const where: any = {};
    if (district && district !== "ALL") {
      where.district = district as string;
    }

    const dealerProfiles = await prisma.dealerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    const dealers = dealerProfiles.map((d) => ({
      id: d.userId,
      name: d.user.name,
      shopName: d.businessName,
      phone: d.phone,
      whatsappNumber: d.whatsappNumber,
      address: d.businessAddress,
      district: d.district || "Cuttack",
      rating: 4.8,
      isVerified: d.verificationStatus === "VERIFIED",
    }));

    res.json({ success: true, dealers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
