// controllers/messageController.js
import * as messageService from "../services/messageService.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import Message from "../models/messageModel.js";

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

    res.status(201).json({ data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
