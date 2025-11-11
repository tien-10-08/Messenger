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

  // Populate để client có đủ thông tin hiển thị
  const populated = await Message.findById(msg._id).populate("senderId", "username email");

  // Emit theo room conversation, đảm bảo cả 2 phía (đã join) đều nhận
  io.to(conversationId).emit("getMessage", populated);

  // Emit cập nhật preview cho Sidebar tới tất cả members (kể cả chưa join room)
  const updatedPayload = { conversationId, lastMessage: text, updatedAt: populated.createdAt };
  const memberIds = (convo.members || []).map(m => m.toString());
  memberIds.forEach((uid) => {
    const u = getUser(uid);
    if (u?.socketId) io.to(u.socketId).emit("conversationUpdated", updatedPayload);
  });

  return populated;
};
