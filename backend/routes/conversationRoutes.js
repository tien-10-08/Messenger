import express from "express";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";
import { myConversations, createOrGet } from "../controllers/conversationController.js";

const router = express.Router();

router.get("/", verifyTokenMiddleware, myConversations);
router.post("/", verifyTokenMiddleware, createOrGet);

export default router;
