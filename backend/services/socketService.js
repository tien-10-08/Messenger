import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import { AppError } from "../utils/errorHandler.js";
import { SOCKET_EVENTS, ERROR_MESSAGES } from "../config/constants.js";

let users = [];
let ioRef = null;

export const setIO = (io) => {
  ioRef = io;
};

export const getIO = () => ioRef;

/**
 * Add user to online list
 */
export const addUser = (userId, socketId) => {
  users = users.filter((u) => u.userId !== userId);
  users.push({ userId, socketId });
};

/**
 * Remove user from online list
 */
export const removeUser = (socketId) => {
  const user = users.find((u) => u.socketId === socketId);
  users = users.filter((u) => u.socketId !== socketId);
  return user;
};

/**
 * Get user by userId
 */
export const getUser = (userId) => {
  return users.find((u) => u.userId === userId);
};

/**
 * Get all online users
 */
export const getAllUsers = () => users;

/**
 * Create message & broadcast to conversation room
 */
export const createAndSendMessage = async (io, { conversationId, senderId, receiverId, text }) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo) throw new AppError(ERROR_MESSAGES.CONVERSATION_NOT_FOUND);

  const msg = await Message.create({
    conversationId,
    senderId,
    text,
    type: "text",
  });

  convo.lastMessage = text;
  await convo.save();

  // Populate sender info
  const populated = await Message.findById(msg._id).populate("senderId", "_id username email avatar");

  // Broadcast to room
  io.to(conversationId).emit(SOCKET_EVENTS.GET_MESSAGE, populated);

  // Echo to sender (for sync if not yet joined room)
  const senderSock = getUser(senderId?.toString?.() || String(senderId));
  if (senderSock?.socketId) {
    io.to(senderSock.socketId).emit(SOCKET_EVENTS.GET_MESSAGE, populated);
  }

  // Update sidebar for all members
  const updatedPayload = {
    conversationId: String(conversationId),
    lastMessage: text,
    updatedAt: populated.createdAt,
  };

  const memberIds = (convo.members || []).map((m) => m.toString());
  memberIds.forEach((uid) => {
    const u = getUser(uid);
    if (u?.socketId) {
      io.to(u.socketId).emit(SOCKET_EVENTS.CONVERSATION_UPDATED, updatedPayload);
    }
  });

  return populated;
};
