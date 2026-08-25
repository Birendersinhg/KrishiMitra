import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { price: "asc" },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      price: p.price,
      rating: 4.8,
      imageUrl: p.imageUrl,
      amazonUrl: p.purchaseUrl,
      flipkartUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(p.name + " fertilizer agriculture")}`,
      suitableFor: p.recommendedFor,
    }));

    res.json({ success: true, products: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({
      success: true,
      product: {
        ...product,
        rating: 4.8,
        amazonUrl: product.purchaseUrl,
        flipkartUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(product.name + " fertilizer agriculture")}`,
        suitableFor: product.recommendedFor,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
