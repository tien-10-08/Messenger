import Conversation from "../models/conversationModel.js";

export const getMyConversations = async (userId) => {
  const convos = await Conversation
    .find({ members: userId })
    .sort({ updatedAt: -1 })
    .populate("members", "username email");
  return convos;
};

export const createOrGetConversation = async (userA, userB) => {
  let convo = await Conversation.findOne({
    members: { $all: [userA, userB], $size: 2 },
  });

  if (!convo) {
    convo = await Conversation.create({ members: [userA, userB] });
  }
  return convo;
};
