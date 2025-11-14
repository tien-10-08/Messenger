import { apiClient } from "./apiConfig";

/**
 * 🔍 Tìm user theo từ khóa
 */
export const searchUsers = async (keyword) => {
  const res = await apiClient.get(`/users?q=${encodeURIComponent(keyword)}`);
  return res.data.data || [];
};

/**
 * 👤 Lấy thông tin user theo ID
 */
export const getUserProfile = async (userId) => {
  const res = await apiClient.get(`/users/${userId}`);
  return res.data.data || {};
};

/**
 * ✏️ Cập nhật thông tin user
 */
export const updateUserProfile = async (userId, updates) => {
  const res = await apiClient.put(`/users/${userId}`, updates);
  return res.data?.data || res.data || {};
};

