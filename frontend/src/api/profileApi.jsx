import { apiClient } from "./apiConfig";

/**
 * 👤 Lấy thông tin profile của chính mình
 */
export const getMyProfile = async () => {
  const res = await apiClient.get(`/profile/me`);
  return res.data.data;
};

/**
 * 🔍 Lấy profile của người khác
 */
export const getProfile = async (userId) => {
  const res = await apiClient.get(`/profile/${userId}`);
  return res.data.data;
};

/**
 * ✏️ Cập nhật profile
 */
export const updateProfile = async (_userIdIgnored, data) => {
  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;

  const res = await apiClient.patch(`/profile/update`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });

  return res.data.data;
};

