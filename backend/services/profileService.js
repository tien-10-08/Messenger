// services/profileService.js
import User from "../models/userModel.js";

/**
 * Lấy thông tin user
 * @param {String} userId
 * @param {Object} options
 * @param {Boolean} options.includePrivate - có trả email / createdAt không
 */
export const getProfile = async (userId, { includePrivate = false } = {}) => {
  const baseFields = "_id username avatar status";
  const privateFields = " email createdAt updatedAt";

  const fields = includePrivate ? baseFields + privateFields : baseFields;

  const user = await User.findById(userId).select(fields);
  if (!user) throw new Error("Không tìm thấy người dùng");

  return user;
};

/** Cập nhật profile */
export const updateProfile = async (userId, updates) => {
  const allowed = ["username", "status", "avatar"];
  const data = {};
  allowed.forEach((key) => {
    if (updates[key] !== undefined) data[key] = updates[key];
  });

  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
    select: "_id username email avatar status updatedAt",
  });

  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};
