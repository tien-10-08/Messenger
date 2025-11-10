
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const markAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (!message.isSeenBy.includes(userId)) {
      message.isSeenBy.push(userId);
      await message.save();
    }

    res.status(200).json({ message: "Seen updated", data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const uploadMediaMessage = async (req, res) => {
  try {
    const { conversationId, type } = req.body; // type: "image" | "voice"
    const senderId = req.user.id;

    if (!req.file) return res.status(400).json({ error: "Missing file" });

    // Upload file lên Cloudinary
    const uploadRes = await cloudinary.uploader.upload(req.file.path, {
      folder: "messenger_media",
      resource_type: type === "voice" ? "video" : "image",
    });

    fs.unlinkSync(req.file.path); // xoá file local

    // Lưu message DB
    const message = await Message.create({
      conversationId,
      senderId,
      type,
      mediaUrl: uploadRes.secure_url,
    });

    res.status(201).json({ data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
