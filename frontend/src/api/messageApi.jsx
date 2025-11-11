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
 * 💬 Lấy tin nhắn theo conversation + pagination
 */
export const getMessages = (conversationId, page = 1, limit = 20) =>
  API.get(`/messages/${conversationId}?page=${page}&limit=${limit}`);

/**
 * 📨 Gửi tin nhắn mới
 */
export const createMessage = (data) => API.post("/messages", data);
