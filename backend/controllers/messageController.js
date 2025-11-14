import * as messageService from "../services/messageService.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import * as socketService from "../services/socketService.js";
import { asyncHandler, AppError } from "../utils/errorHandler.js";
import { SOCKET_EVENTS, CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

/**
 * 📨 Gửi tin nhắn text
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body;
  const senderId = req.user.id;

  if (!conversationId || !text?.trim()) {
    throw new AppError(ERROR_MESSAGES.MESSAGE_MISSING_FIELDS, HTTP_STATUS.BAD_REQUEST);
  }

  const msg = await messageService.createMessage({
    conversationId,
    senderId,
    text: text.trim(),
  });

  res.status(HTTP_STATUS.CREATED).json({ data: msg });
});

/**
 * 💬 Lấy tin nhắn theo conversation
 */
export const getMessagesByConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = CONFIG.DEFAULT_LIMIT } = req.query;

  const result = await messageService.getMessages({
    conversationId: id,
    page,
    limit,
  });

  res.status(HTTP_STATUS.OK).json({
    data: result.items,
    pagination: result.pagination,
  });
});

/**
 * 👀 Đánh dấu tin nhắn đã xem
 */
export const markAsSeen = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const message = await Message.findById(id);
  if (!message) {
    throw new AppError(ERROR_MESSAGES.MESSAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (!message.isSeenBy.includes(userId)) {
    message.isSeenBy.push(userId);
    await message.save();
  }

  // Emit socket event
  try {
    const io = socketService.getIO();
    if (io && message.conversationId) {
      io.to(String(message.conversationId)).emit(SOCKET_EVENTS.MESSAGE_SEEN, {
        conversationId: String(message.conversationId),
        messageId: String(message._id),
        seenBy: String(userId),
      });
    }
  } catch (e) {
    // Silently fail
  }

  res.status(HTTP_STATUS.OK).json({ message: "Seen updated", data: message });
});

/**
 * 📸 / 🎤 Upload ảnh hoặc voice
 */
export const uploadMediaMessage = asyncHandler(async (req, res) => {
  const { conversationId, type } = req.body;
  const senderId = req.user.id;

  if (!req.file) {
    throw new AppError(ERROR_MESSAGES.MESSAGE_MISSING_FILE, HTTP_STATUS.BAD_REQUEST);
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: CONFIG.CLOUDINARY_FOLDER.MEDIA,
    resource_type: type === CONFIG.MESSAGE_TYPES.VOICE ? "video" : "image",
  });

  // Clean up temp file
  fs.unlinkSync(req.file.path);

  // Create message record
  const msg = await Message.create({
    conversationId,
    senderId,
    type,
    mediaUrl: result.secure_url,
  });

  // Update conversation lastMessage
  let convo = null;
  try {
    convo = await Conversation.findById(conversationId);
    if (convo) {
      convo.lastMessage =
        type === CONFIG.MESSAGE_TYPES.IMAGE
          ? "[Ảnh]"
          : type === CONFIG.MESSAGE_TYPES.VOICE
          ? "[Voice]"
          : "";
      await convo.save();
    }
  } catch (e) {
    // Silently fail
  }

  // Populate sender info
  const populated = await Message.findById(msg._id).populate(
    "senderId",
    "_id username email avatar"
  );

  // Emit via socket
  try {
    const io = socketService.getIO();
    if (io && conversationId) {
      const convId = String(conversationId);

      // Send to room
      io.to(convId).emit(SOCKET_EVENTS.GET_MESSAGE, populated);

      // Echo to sender
      const senderSock = socketService.getUser(senderId?.toString?.() || String(senderId));
      if (senderSock?.socketId) {
        io.to(senderSock.socketId).emit(SOCKET_EVENTS.GET_MESSAGE, populated);
      }

      // Update sidebar for all members
      if (convo) {
        const updatedPayload = {
          conversationId: convId,
          lastMessage: convo.lastMessage,
          updatedAt: populated.createdAt,
        };
        const memberIds = (convo.members || []).map((m) => m.toString());
        memberIds.forEach((uid) => {
          const u = socketService.getUser(uid);
          if (u?.socketId) {
            io.to(u.socketId).emit(SOCKET_EVENTS.CONVERSATION_UPDATED, updatedPayload);
          }
        });
      }
    }
  } catch (e) {
    // Silently fail
  }

  res.status(HTTP_STATUS.CREATED).json({ data: populated });
});
