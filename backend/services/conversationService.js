import Conversation from "../models/conversationModel.js";
import { AppError } from "../utils/errorHandler.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

export const getMyConversations = async (userId) => {
  const convos = await Conversation.find({ members: userId })
    .sort({ updatedAt: -1 })
    .populate("members", "_id username email avatar status");
  return convos;
};

export const createOrGetConversation = async (userA, userB) => {
  if (userA.toString() === userB.toString()) {
    throw new AppError("Không thể tạo cuộc trò chuyện với chính mình", HTTP_STATUS.BAD_REQUEST);
  }

  let convo = await Conversation.findOne({
    members: { $all: [userA, userB], $size: 2 },
  });

  if (!convo) {
    convo = await Conversation.create({ members: [userA, userB] });
  }

  const populated = await Conversation.findById(convo._id).populate(
    "members",
    "_id username email avatar status"
  );
  return populated;
};

export const getConversationById = async (id) => {
  const convo = await Conversation.findById(id).populate("members", "_id username email avatar status");
  if (!convo) {
    throw new AppError(ERROR_MESSAGES.CONVERSATION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return convo;
};
