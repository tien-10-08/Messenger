import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * 💬 Lấy danh sách tin nhắn theo conversationId
 * Backend trả { data: [...], pagination: {...} }
 */
export const getMessagesByConversation = async (conversationId, page = 1, limit = 20) => {
  const res = await API.get(`/messages/${conversationId}?page=${page}&limit=${limit}`);
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
    const res = await API.post("/messages", payload);
    return res.data?.data ?? null;
  } catch (err) {
    console.error("❌ sendMessage API error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * 👀 Đánh dấu 1 tin nhắn đã xem
 */
export const markMessageSeen = async (messageId) => {
  await API.patch(`/messages/${messageId}/seen`);
  return true;
};

