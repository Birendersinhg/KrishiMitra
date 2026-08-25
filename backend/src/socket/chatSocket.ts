import { Server as SocketIOServer, Socket } from "socket.io";

export const setupChatSocket = (io: SocketIOServer) => {
  io.on("connection", (socket: Socket) => {
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on("send_message", (data: { conversationId: string; message: any }) => {
      io.to(data.conversationId).emit("receive_message", data.message);
    });

    socket.on("crop_post_created", (post: any) => {
      io.emit("new_crop_post", post);
    });
  });
};
