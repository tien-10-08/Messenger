// routes/userRoutes.js
import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import { verifyTokenMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👥 List/Search Users (trừ chính mình)
router.get("/", verifyTokenMiddleware, getAllUsers);

// 👤 User detail
router.get("/:id", verifyTokenMiddleware, getUserById);

export default router;
