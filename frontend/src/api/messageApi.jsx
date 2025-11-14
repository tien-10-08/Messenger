import { apiClient } from "./apiConfig";

/**
 * 💬 Lấy danh sách tin nhắn theo conversationId
 */
export const getMessagesByConversation = async (
  conversationId,
  page = 1,
  limit = 20
) => {
  const res = await apiClient.get(
    `/messages/${conversationId}?page=${page}&limit=${limit}`
  );
  return {
    items: res.data.data || [],
    pagination: res.data.pagination || null,
  };
};

/**
 * 📨 Gửi tin nhắn mới
 */
export const sendMessage = async (payload) => {
  try {
    const res = await apiClient.post("/messages", payload);
    return res.data?.data ?? null;
  } catch (err) {
    console.error("❌ sendMessage API error:", err);
    throw err;
  }
};

/**
 * 👀 Đánh dấu 1 tin nhắn đã xem
 */
export const markMessageSeen = async (messageId) => {
  await apiClient.patch(`/messages/${messageId}/seen`);
  return true;
};

/**
 * 📸 / 🎤 Upload tin nhắn media (image hoặc voice)
 */
export const uploadMediaMessage = async (formData) => {
  const res = await apiClient.post("/messages/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data ?? null;
};


