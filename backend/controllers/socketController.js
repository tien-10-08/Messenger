import * as socketService from "../services/socketService.js";
import * as messageService from "../services/messageService.js";

export const handleUserConnect = (io, socket, userId) => {
  socketService.addUser(userId, socket.id);
  io.emit("getUsers", socketService.getAllUsers());
};

export const handleUserDisconnect = (io, socket) => {
  socketService.removeUser(socket.id);
  io.emit("getUsers", socketService.getAllUsers());
};

export const handleSendMessage = async (io, socket, data) => {
  try {
    const msg = await socketService.createAndSendMessage(io, data);
    // Đã emit theo room trong service, không cần echo riêng cho sender để tránh trùng
  } catch (err) {
    console.error("sendMessage error:", err.message);
    socket.emit("errorMessage", err.message);
  }
};

export const handleTyping = (io, socket, { receiverId, senderId }) => {
  const receiver = socketService.getUser(receiverId);
  if (receiver) io.to(receiver.socketId).emit("userTyping", { senderId });
};

export const handleJoinConversation = async (io, socket, { conversationId }) => {
  try {
    if (!conversationId) return socket.emit("errorMessage", "Thiếu conversationId");
    socket.join(conversationId);
    const result = await messageService.getMessages({ conversationId, page: 1, limit: 20 });
    io.to(socket.id).emit("conversationHistory", {
      conversationId,
      items: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("joinConversation error:", err.message);
    socket.emit("errorMessage", err.message);
  }
};
