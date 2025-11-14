import User from "../models/userModel.js";
import mongoose from "mongoose";
import { AppError } from "../utils/errorHandler.js";
import { CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

/**
 * 🔍 Lấy thông tin user theo id
 */
export const getUser = async (userId) => {
  if (!userId) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);

  const user = await User.findById(userId).select(CONFIG.SAFE_USER_FIELDS);
  if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

  return user;
};

/**
 * 🔍 Tìm kiếm user theo keyword
 */
export const searchUsers = async ({ meId, keyword = "", page = 1, limit = 10 }) => {
  const query = { _id: { $ne: new mongoose.Types.ObjectId(meId) } };

  if (keyword.trim()) {
    const regex = new RegExp(keyword.trim(), "i");
    query.$or = [{ username: regex }, { email: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const actualLimit = Math.min(Number(limit), CONFIG.MAX_LIMIT);

  const [items, total] = await Promise.all([
    User.find(query)
      .select(CONFIG.SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(actualLimit),
    User.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: actualLimit,
      total,
      totalPages: Math.ceil(total / actualLimit),
    },
  };
};
