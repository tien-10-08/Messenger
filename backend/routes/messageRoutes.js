import express from "express";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";
import { sendMessage, getMessagesByConversation } from "../controllers/messageController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadMediaMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:id", verifyTokenMiddleware, getMessagesByConversation); // id = conversationId
router.post("/", verifyTokenMiddleware, sendMessage);
router.patch("/:id/seen", verifyTokenMiddleware, markAsSeen);
router.post("/upload", verifyTokenMiddleware, upload.single("file"), uploadMediaMessage);

export default router;
