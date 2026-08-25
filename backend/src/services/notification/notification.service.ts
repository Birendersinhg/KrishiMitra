import { prisma } from "../../config/prisma.js";

export class NotificationService {
  public static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: "WEATHER" | "ALERT" | "DEALER_REPLY" | "ADVISORY" = "ADVISORY"
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          read: false,
        },
      });
    } catch (e) {
      console.error("Failed to create notification:", e);
      return null;
    }
  }

  public static async getUserNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  public static async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
