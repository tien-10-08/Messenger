import * as socketService from "../services/socketService.js";
import * as messageService from "../services/messageService.js";

export const handleUserConnect = (io, socket, userId) => {
  socketService.addUser(userId, socket.id);
  io.emit("getUsers", socketService.getAllUsers());
  io.emit("presenceUpdated", { userId, online: true });
};

export const handleUserDisconnect = (io, socket) => {
  const removed = socketService.removeUser(socket.id);
  io.emit("getUsers", socketService.getAllUsers());
  if (removed?.userId) io.emit("presenceUpdated", { userId: removed.userId, online: false });
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

export const handleTyping = (io, socket, { conversationId, userId, isTyping }) => {
  if (!conversationId || !userId) return;
  io.to(conversationId).emit("userTyping", { conversationId, userId, isTyping: !!isTyping });
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

// ==== WebRTC voice call signaling ====

export const handleCallUser = (io, socket, { toUserId, fromUser, offer, callType }) => {
  if (!toUserId || !offer) return;
  const callee = socketService.getUser(toUserId);
  if (!callee?.socketId) return;
  io.to(callee.socketId).emit("incomingCall", {
    fromUser,
    fromSocketId: socket.id,
    offer,
    callType: callType || "audio",
  });
};

export const handleAnswerCall = (io, socket, { toSocketId, answer }) => {
  if (!toSocketId || !answer) return;
  io.to(toSocketId).emit("callAnswered", { answer });
};

export const handleIceCandidate = (io, socket, { toSocketId, candidate }) => {
  if (!toSocketId || !candidate) return;
  io.to(toSocketId).emit("iceCandidate", { candidate });
};

export const handleEndCall = (io, socket, { toSocketId }) => {
  if (!toSocketId) return;
  io.to(toSocketId).emit("callEnded");
};

