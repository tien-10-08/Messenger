import User from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";
import { CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

/**
 * Lấy thông tin user
 */
export const getProfile = async (userId, { includePrivate = false } = {}) => {
  const baseFields = "_id username avatar status";
  const privateFields = " email createdAt updatedAt";
  const fields = includePrivate ? baseFields + privateFields : baseFields;

  const user = await User.findById(userId).select(fields);
  if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return user;
};

/** Cập nhật profile */
export const updateProfile = async (userId, updates) => {
  const allowed = ["username", "status", "avatar"];
  const data = {};

  allowed.forEach((key) => {
    if (updates[key] !== undefined && updates[key] !== null) {
      data[key] = String(updates[key]).trim();
    }
  });

  if (Object.keys(data).length === 0) {
    throw new AppError("Không có dữ liệu để cập nhật", HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
    select: "_id username email avatar status updatedAt",
  });

  if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return user;
};
