import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import { AppError } from "../utils/errorHandler.js";
import { CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

/**
 * 📨 Tạo tin nhắn mới, cập nhật lastMessage & updatedAt
 */
export const createMessage = async ({ conversationId, senderId, text }) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo) {
    throw new AppError(ERROR_MESSAGES.CONVERSATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isMember = convo.members.some((m) => m.toString() === senderId.toString());
  if (!isMember) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_MEMBER, HTTP_STATUS.FORBIDDEN);
  }

  const msg = await Message.create({
    conversationId,
    senderId,
    text: text.trim(),
    type: CONFIG.MESSAGE_TYPES.TEXT,
  });

  // Update conversation lastMessage
  convo.lastMessage = text.trim() || "";
  await convo.save();

  // Populate sender info
  const populated = await Message.findById(msg._id).populate("senderId", "username email avatar");
  return populated;
};

/**
 * 💬 Lấy tin nhắn theo conversation với pagination
 */
export const getMessages = async ({ conversationId, page = 1, limit = 20 }) => {
  const actualLimit = Math.min(Number(limit), CONFIG.MAX_LIMIT);
  const skip = (Number(page) - 1) * actualLimit;

  const [items, total] = await Promise.all([
    Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(actualLimit)
      .populate("senderId", "username email avatar"),
    Message.countDocuments({ conversationId }),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: actualLimit,
      total,
      totalPages: Math.ceil(total / actualLimit),
    },
  };
};
