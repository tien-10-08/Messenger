import * as socketService from "../services/socketService.js";
import * as messageService from "../services/messageService.js";
import { SOCKET_EVENTS } from "../config/constants.js";

/**
 * Handle user connection
 */
export const handleUserConnect = (io, socket, userId) => {
  socketService.addUser(userId, socket.id);
  io.emit(SOCKET_EVENTS.GET_USERS, socketService.getAllUsers());
  io.emit(SOCKET_EVENTS.PRESENCE_UPDATED, { userId, online: true });
};

/**
 * Handle user disconnect
 */
export const handleUserDisconnect = (io, socket) => {
  const removed = socketService.removeUser(socket.id);
  io.emit(SOCKET_EVENTS.GET_USERS, socketService.getAllUsers());

  if (removed?.userId) {
    io.emit(SOCKET_EVENTS.PRESENCE_UPDATED, { userId: removed.userId, online: false });
  }
};

/**
 * Handle send message
 */
export const handleSendMessage = async (io, socket, data) => {
  try {
    await socketService.createAndSendMessage(io, data);
  } catch (err) {
    console.error("❌ sendMessage error:", err.message);
    socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, err.message);
  }
};

/**
 * Handle typing indicator
 */
export const handleTyping = (io, socket, { conversationId, userId, isTyping }) => {
  if (!conversationId || !userId) return;

  io.to(conversationId).emit(SOCKET_EVENTS.USER_TYPING, {
    conversationId,
    userId,
    isTyping: !!isTyping,
  });
};

/**
 * Handle join conversation room
 */
export const handleJoinConversation = async (io, socket, { conversationId }) => {
  try {
    if (!conversationId) {
      throw new Error("Thiếu conversationId");
    }

    socket.join(conversationId);

    // Send conversation history
    const result = await messageService.getMessages({
      conversationId,
      page: 1,
      limit: 20,
    });

    io.to(socket.id).emit(SOCKET_EVENTS.CONVERSATION_HISTORY, {
      conversationId,
      items: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("❌ joinConversation error:", err.message);
    socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, err.message);
  }
};

// ==== WebRTC Voice Call Signaling ====

/**
 * Handle call initiation
 */
export const handleCallUser = (io, socket, { toUserId, fromUser, offer, callType }) => {
  if (!toUserId || !offer) return;

  const callee = socketService.getUser(toUserId);
  if (!callee?.socketId) return;

  io.to(callee.socketId).emit(SOCKET_EVENTS.INCOMING_CALL, {
    fromUser,
    fromSocketId: socket.id,
    offer,
    callType: callType || "audio",
  });
};

/**
 * Handle call answer
 */
export const handleAnswerCall = (io, socket, { toSocketId, answer }) => {
  if (!toSocketId || !answer) return;

  io.to(toSocketId).emit(SOCKET_EVENTS.CALL_ANSWERED, { answer });
};

/**
 * Handle ICE candidate
 */
export const handleIceCandidate = (io, socket, { toSocketId, candidate }) => {
  if (!toSocketId || !candidate) return;

  io.to(toSocketId).emit(SOCKET_EVENTS.ICE_CANDIDATE, { candidate });
};

/**
 * Handle call end
 */
export const handleEndCall = (io, socket, { toSocketId }) => {
  if (!toSocketId) return;

  io.to(toSocketId).emit(SOCKET_EVENTS.CALL_ENDED);
};

