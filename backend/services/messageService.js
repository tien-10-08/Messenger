import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";


export const createMessage = async ({ conversationId, senderId, text }) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo) throw new Error("Conversation không tồn tại");

  const isMember = convo.members.some((m) => m.toString() === senderId.toString());
  if (!isMember) throw new Error("Bạn không thuộc cuộc trò chuyện này");

  const msg = await Message.create({ conversationId, senderId, text });

  convo.lastMessage = text || "";
  await convo.save(); 

  const populated = await Message.findById(msg._id)
    .populate("senderId", "username email");
  return populated;
};


export const getMessages = async ({ conversationId, page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Message.find({ conversationId })
      .sort({ createdAt: 1 }) 
      .skip(skip)
      .limit(Number(limit))
      .populate("senderId", "username email"),
    Message.countDocuments({ conversationId }),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
