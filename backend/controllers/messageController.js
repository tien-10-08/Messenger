// controllers/messageController.js
import * as messageService from "../services/messageService.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import Message from "../models/messageModel.js";
import * as socketService from "../services/socketService.js";
import Conversation from "../models/conversationModel.js";

// 📨 Gửi tin nhắn text
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !text)
      return res.status(400).json({ error: "Thiếu conversationId hoặc text" });

    const msg = await messageService.createMessage({
      conversationId,
      senderId,
      text,
    });

    res.status(201).json({ data: msg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 💬 Lấy tin nhắn theo conversation
export const getMessagesByConversation = async (req, res) => {
  try {
    const { id } = req.params; // conversationId
    const { page = 1, limit = 20 } = req.query;

    const result = await messageService.getMessages({
      conversationId: id,
      page,
      limit,
    });

    res.status(200).json({
      data: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 👀 Đánh dấu tin nhắn đã xem
export const markAsSeen = async (req, res) => {
  try {
    const { id } = req.params; // messageId
    const userId = req.user.id;

    const message = await Message.findById(id);
    if (!message)
      return res.status(404).json({ error: "Không tìm thấy tin nhắn" });

    if (!message.isSeenBy.includes(userId)) {
      message.isSeenBy.push(userId);
      await message.save();
    }

    // Emit socket event to the conversation room so both sides update UI
    try {
      const io = socketService.getIO?.();
      if (io && message.conversationId) {
        io.to(String(message.conversationId)).emit("messageSeen", {
          conversationId: String(message.conversationId),
          messageId: String(message._id),
          seenBy: String(userId),
        });
      }
    } catch (e) {
      // noop
    }

    res.status(200).json({ message: "Seen updated", data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📸 Upload ảnh hoặc voice
export const uploadMediaMessage = async (req, res) => {
  try {
    const { conversationId, type } = req.body; // type: "image" | "voice"
    const senderId = req.user.id;

    if (!req.file)
      return res.status(400).json({ error: "Thiếu file upload" });

    // Upload lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "messenger_media",
      resource_type: type === "voice" ? "video" : "image",
    });

    // Xóa file tạm local
    fs.unlinkSync(req.file.path);

    // Lưu message vào MongoDB
    const msg = await Message.create({
      conversationId,
      senderId,
      type,
      mediaUrl: result.secure_url,
    });

    // Cập nhật lastMessage cho conversation (hiển thị ở Sidebar)
    let convo = null;
    try {
      convo = await Conversation.findById(conversationId);
      if (convo) {
        convo.lastMessage = type === "image" ? "[Ảnh]" : type === "voice" ? "[Voice]" : "";
        await convo.save();
      }
    } catch {}

    // Populate sender cho client dễ hiển thị
    const populated = await Message.findById(msg._id).populate("senderId", "username email");

    // Emit qua socket giống gửi text để client nhận realtime
    try {
      const io = socketService.getIO?.();
      if (io && conversationId) {
        const convId = String(conversationId);

        // Gửi message tới room
        io.to(convId).emit("getMessage", populated);

        // Echo cho sender (phòng trường hợp chưa join room)
        const senderSock = socketService.getUser(senderId?.toString?.() || String(senderId));
        if (senderSock?.socketId) io.to(senderSock.socketId).emit("getMessage", populated);

        // Cập nhật preview Sidebar cho tất cả member
        if (convo) {
          const updatedPayload = {
            conversationId: convId,
            lastMessage: convo.lastMessage,
            updatedAt: populated.createdAt,
          };
          const memberIds = (convo.members || []).map(m => m.toString());
          memberIds.forEach((uid) => {
            const u = socketService.getUser(uid);
            if (u?.socketId) io.to(u.socketId).emit("conversationUpdated", updatedPayload);
          });
        }
      }
    } catch {}

    res.status(201).json({ data: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
