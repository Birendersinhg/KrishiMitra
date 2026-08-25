import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { prisma } from "../../prisma/client.js";

let io: SocketIOServer | null = null;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("register_user", (userId: string) => {
      socket.join(`user_${userId}`);
    });

    socket.on("join_room", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on("send_message", async (data: { conversationId: string; senderId: string; content: string }) => {
      try {
        const msg = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: data.senderId,
            message: data.content,
          },
        });

        io?.to(data.conversationId).emit("new_message", {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          content: msg.message,
          createdAt: msg.createdAt,
        });
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO() {
  return io;
}
