// controllers/profileController.js
import * as profileService from "../services/profileService.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

/** 🧾 Xem profile của chính mình */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await profileService.getProfile(userId, { includePrivate: true });
    res.status(200).json({ data: user });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/** 🔍 Xem profile người khác (public info only) */
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const meId = req.user.id;

    if (id === meId) {
      // Nếu xem chính mình, trả thông tin đầy đủ
      const user = await profileService.getProfile(meId, { includePrivate: true });
      return res.status(200).json({ data: user });
    }

    // Nếu xem người khác → chỉ trả public info
    const user = await profileService.getProfile(id, { includePrivate: false });
    res.status(200).json({ data: user });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/** 🛠️ Cập nhật profile (chỉ chính chủ) */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = { ...req.body };

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
        width: 300,
        height: 300,
        crop: "fill",
      });
      fs.unlinkSync(req.file.path);
      updates.avatar = uploadRes.secure_url;
    }

    const user = await profileService.updateProfile(userId, updates);
    res.status(200).json({ message: "Cập nhật thành công", data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
