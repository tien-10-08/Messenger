// src/api/messageApi.js
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
 * 💬 Lấy tin nhắn theo conversationId (backend: GET /api/messages/:id)
 * Có hỗ trợ phân trang (page, limit)
 */
export const getMessagesByConversation = (conversationId, page = 1, limit = 20) => {
  if (!conversationId) throw new Error("Thiếu conversationId");
  return API.get(`/messages/${conversationId}?page=${page}&limit=${limit}`);
};

/**
 * 📨 Gửi tin nhắn mới (backend: POST /api/messages)
 * body cần { conversationId, senderId, text }
 */
export const sendMessage = (data) => {
  if (!data?.conversationId || !data?.senderId) {
    throw new Error("Thiếu conversationId hoặc senderId");
  }
  return API.post("/messages", data);
};
