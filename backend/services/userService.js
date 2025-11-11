// services/userService.js
import User from "../models/userModel.js";
import mongoose from "mongoose";

const SAFE_PROJECTION = "_id username email avatar status createdAt updatedAt";

/**
 * Lấy danh sách user (trừ bản thân), hỗ trợ tìm kiếm + phân trang
 * @param {Object} params
 * @param {String} params.meId   - id của user hiện tại (để loại trừ)
 * @param {String} params.q      - từ khoá tìm kiếm username/email
 * @param {Number} params.page   - trang
 * @param {Number} params.limit  - số lượng/trang
 */
export const listUsers = async ({ meId, q = "", page = 1, limit = 20 }) => {
  const conditions = {
    _id: { $ne: new mongoose.Types.ObjectId(meId) },
  };

  if (q && q.trim()) {
    const keyword = q.trim();
    conditions.$or = [
      { username: { $regex: keyword, $options: "i" } },
      { email:    { $regex: keyword, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    User.find(conditions)
      .select(SAFE_PROJECTION)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(conditions),
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


export const getUser = async (id) => {
  const user = await User.findById(id).select(SAFE_PROJECTION);
  return user;
};
