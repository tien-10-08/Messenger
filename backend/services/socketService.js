import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

let users = [];

export const addUser = (userId, socketId) => {
  if (!users.some((u) => u.userId === userId)) users.push({ userId, socketId });
};

export const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

export const getUser = (userId) => users.find((u) => u.userId === userId);
export const getAllUsers = () => users;

export const createAndSendMessage = async (io, { conversationId, senderId, receiverId, text }) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo) throw new Error("Conversation not found");

  const msg = await Message.create({ conversationId, senderId, text });
  convo.lastMessage = text;
  await convo.save();

  const receiver = getUser(receiverId);
  if (receiver) io.to(receiver.socketId).emit("getMessage", msg);

  return msg;
};
