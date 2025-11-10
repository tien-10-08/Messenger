// src/api/chatService.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // ⚙️ backend của bạn
});

// middleware: tự thêm token vào header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 📩 Lấy danh sách hội thoại của user
export const getConversations = async (userId) => {
  const res = await API.get(`/conversations/${userId}`);
  return res.data;
};

// 💬 Lấy tin nhắn theo conversationId
export const getMessages = async (conversationId) => {
  const res = await API.get(`/messages/${conversationId}`);
  return res.data;
};

// ✉️ Gửi tin nhắn mới
export const sendMessage = async (conversationId, senderId, text) => {
  const res = await API.post(`/messages`, { conversationId, senderId, text });
  return res.data;
};
