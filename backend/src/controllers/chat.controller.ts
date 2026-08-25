import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";

export const getConversations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const enriched = await Promise.all(
      conversations.map(async (c) => {
        const farmer = await prisma.user.findUnique({ where: { id: c.farmerId }, select: { id: true, name: true, role: true } });
        const dealer = await prisma.user.findUnique({ where: { id: c.dealerId }, select: { id: true, name: true, role: true } });
        return {
          id: c.id,
          farmerId: c.farmerId,
          dealerId: c.dealerId,
          user1: farmer || { id: c.farmerId, name: "Farmer", role: "FARMER" },
          user2: dealer || { id: c.dealerId, name: "Agro Dealer", role: "DEALER" },
          messages: c.messages,
        };
      })
    );

    res.json({ success: true, conversations: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientId } = req.body;
    let farmer = await prisma.user.findFirst({ where: { role: "FARMER" } });
    const farmerId = farmer ? farmer.id : "farmer-demo-1";
    const dealerId = recipientId || "dealer-demo-1";

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { farmerId, dealerId },
          { farmerId: dealerId, dealerId: farmerId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          farmerId,
          dealerId,
        },
      });
    }

    const farmerUser = await prisma.user.findUnique({ where: { id: conversation.farmerId }, select: { id: true, name: true, role: true } });
    const dealerUser = await prisma.user.findUnique({ where: { id: conversation.dealerId }, select: { id: true, name: true, role: true } });

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        user1: farmerUser || { id: conversation.farmerId, name: "Farmer", role: "FARMER" },
        user2: dealerUser || { id: conversation.dealerId, name: "Agro Dealer", role: "DEALER" },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });
    res.json({
      success: true,
      messages: messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        content: m.message,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    let user = await prisma.user.findFirst();
    const senderId = user ? user.id : "farmer-demo-1";

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId,
        message: content || "",
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    res.json({
      success: true,
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.message,
        createdAt: message.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
