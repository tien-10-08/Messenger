import User from "../models/userModel.js";
import mongoose from "mongoose";

const SAFE_FIELDS = "_id username email avatar status createdAt";

/**
 * 🔍 Lấy thông tin user theo id
 * @param {String} userId
 */
export const getUser = async (userId) => {
  if (!userId) throw new Error("UserId is required");

  const user = await User.findById(userId).select(SAFE_FIELDS);
  if (!user) throw new Error("User not found");

  return user;
};

/**
 * 🔍 Tìm kiếm user theo keyword (username hoặc email)
 * @param {Object} params
 * @param {String} params.meId - id user hiện tại (để loại trừ)
 * @param {String} params.keyword - từ khóa tìm kiếm
 * @param {Number} params.page - số trang
 * @param {Number} params.limit - số lượng user/trang
 */
export const searchUsers = async ({ meId, keyword = "", page = 1, limit = 10 }) => {
  const query = { _id: { $ne: new mongoose.Types.ObjectId(meId) } };

  if (keyword.trim()) {
    const regex = new RegExp(keyword.trim(), "i"); // không phân biệt hoa thường
    query.$or = [{ username: regex }, { email: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    User.find(query)
      .select(SAFE_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
