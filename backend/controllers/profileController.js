import * as profileService from "../services/profileService.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import * as socketService from "../services/socketService.js";
import Conversation from "../models/conversationModel.js";
import { asyncHandler, AppError } from "../utils/errorHandler.js";
import { CONFIG, HTTP_STATUS, SOCKET_EVENTS } from "../config/constants.js";

/**
 * 🧾 Xem profile của chính mình
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await profileService.getProfile(userId, { includePrivate: true });

  res.status(HTTP_STATUS.OK).json({ data: user });
});

/**
 * 🔍 Xem profile người khác (public info only)
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meId = req.user.id;

  if (id === meId) {
    const user = await profileService.getProfile(meId, { includePrivate: true });
    return res.status(HTTP_STATUS.OK).json({ data: user });
  }

  const user = await profileService.getProfile(id, { includePrivate: false });
  res.status(HTTP_STATUS.OK).json({ data: user });
});

/**
 * 🛠️ Cập nhật profile
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = { ...req.body };

  // Upload avatar if provided
  if (req.file) {
    const uploadRes = await cloudinary.uploader.upload(req.file.path, {
      folder: CONFIG.CLOUDINARY_FOLDER.AVATARS,
      width: CONFIG.IMAGE_DIMENSIONS.AVATAR_WIDTH,
      height: CONFIG.IMAGE_DIMENSIONS.AVATAR_HEIGHT,
      crop: "fill",
    });

    fs.unlinkSync(req.file.path);
    updates.avatar = uploadRes.secure_url;
  }

  const user = await profileService.updateProfile(userId, updates);

  res.status(HTTP_STATUS.OK).json({
    message: "Cập nhật thành công",
    data: user,
  });

  // Emit socket events to notify other users
  const io = socketService.getIO();
  if (io) {
    // Notify to user's own connections
    const me = socketService.getUser(userId);
    if (me?.socketId) {
      io.to(me.socketId).emit(SOCKET_EVENTS.USER_UPDATED, { user });
    }

    // Notify to conversation partners
    const convos = await Conversation.find({ members: userId }).select("members");
    const partnerIds = new Set();

    convos.forEach((c) => {
      (c.members || []).forEach((m) => {
        if (String(m) !== String(userId)) {
          partnerIds.add(String(m));
        }
      });
    });

    partnerIds.forEach((pid) => {
      const u = socketService.getUser(pid);
      if (u?.socketId) {
        io.to(u.socketId).emit(SOCKET_EVENTS.USER_UPDATED, { user });
      }
    });
  }
});
