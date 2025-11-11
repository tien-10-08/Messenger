// src/api/conversationApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 📋 Lấy danh sách hội thoại
export const getMyConversations = () => API.get("/conversations");

// 💬 Tạo hoặc lấy cuộc trò chuyện (backend cần partnerId)
export const createOrGetConversation = (partnerId) =>
  API.post("/conversations", { partnerId });
