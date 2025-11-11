// routes/profileRoutes.js
import express from "express";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// 👤 Xem profile của chính mình
router.get("/me", verifyTokenMiddleware, getMyProfile);

// 🔍 Xem profile người khác (public)
router.get("/:id", verifyTokenMiddleware, getUserProfile);

// ✏️ Cập nhật profile cá nhân
router.patch(
  "/update",
  verifyTokenMiddleware,
  upload.single("avatar"),
  updateMyProfile
);

export default router;
