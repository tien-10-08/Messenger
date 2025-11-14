import { apiClient } from "./apiConfig";

/**
 * 💬 Lấy danh sách các cuộc trò chuyện của tôi
 */
export const getMyConversations = async () => {
  const res = await apiClient.get("/conversations");
  return res.data.data || [];
};

/**
 * 💬 Tạo hoặc lấy cuộc trò chuyện giữa 2 người
 */
export const createOrGetConversation = async (partnerId) => {
  const res = await apiClient.post("/conversations", { partnerId });
  return res.data.data || res.data;
};

