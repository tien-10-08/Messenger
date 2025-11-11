import Conversation from "../models/conversationModel.js";

export const getMyConversations = async (userId) => {
  const convos = await Conversation
    .find({ members: userId })
    .sort({ updatedAt: -1 })
    .populate("members", "username email avatar");
  return convos;
};

export const createOrGetConversation = async (userA, userB) => {
  let convo = await Conversation.findOne({
    members: { $all: [userA, userB], $size: 2 },
  });

  if (!convo) {
    convo = await Conversation.create({ members: [userA, userB] });
  }
  const populated = await Conversation.findById(convo._id).populate("members", "username email avatar");
  return populated;
};

export const getConversationById = async (id) => {
  const convo = await Conversation.findById(id).populate("members", "username email avatar");
  return convo;
};
