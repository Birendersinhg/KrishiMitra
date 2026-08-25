import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { saveBase64Image } from "../services/storage/storage.service.js";

export const getCropPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.cropPost.findMany({
      include: {
        farmer: { select: { id: true, name: true, phone: true } },
        responses: { include: { dealer: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, posts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCropPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cropName, problem, location, imageUrl } = req.body;
    let savedUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith("data:")) {
      savedUrl = saveBase64Image(imageUrl);
    }

    let farmer = await prisma.user.findFirst({ where: { role: "FARMER" } });
    const farmerId = farmer ? farmer.id : "farmer-demo-1";

    const post = await prisma.cropPost.create({
      data: {
        farmerId,
        cropName: cropName || "Paddy",
        description: problem || "Crop issue reported",
        problem: problem || "Need fertilizer advice",
        location: location || "Cuttack, Odisha",
        imageUrl: savedUrl || "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80",
        status: "OPEN",
      },
    });

    res.json({ success: true, post });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToCropPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    let dealer = await prisma.dealerProfile.findFirst();
    const dealerId = dealer ? dealer.id : "dealer-profile-1";

    const response = await prisma.dealerResponse.create({
      data: {
        cropPostId: id,
        dealerId,
        message,
      },
    });

    await prisma.cropPost.update({
      where: { id },
      data: { status: "RESPONDED" },
    });

    res.json({ success: true, response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
