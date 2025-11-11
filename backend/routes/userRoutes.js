// routes/userRoutes.js
import express from "express";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";
import { searchUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

// 🔍 Tìm kiếm user theo keyword (GET /api/users?q=abc)
router.get("/", verifyTokenMiddleware, searchUsers);

// 👤 Lấy thông tin 1 user cụ thể (GET /api/users/:id)
router.get("/:id", verifyTokenMiddleware, getUserById);

export default router;
