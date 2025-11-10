// routes/messageRoutes.js
import express from "express";
import {
  sendMessage,
  getMessagesByConversation,
  markAsSeen,
  uploadMediaMessage,
} from "../controllers/messageController.js";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 🔹 Lấy tất cả tin nhắn theo conversationId
router.get("/:id", verifyTokenMiddleware, getMessagesByConversation);

// 🔹 Gửi tin nhắn text
router.post("/", verifyTokenMiddleware, sendMessage);

// 🔹 Đánh dấu tin nhắn đã xem
router.patch("/:id/seen", verifyTokenMiddleware, markAsSeen);

// 🔹 Upload ảnh hoặc voice
router.post(
  "/upload",
  verifyTokenMiddleware,
  upload.single("file"),
  uploadMediaMessage
);

export default router;
