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
 * 📋 Lấy danh sách hội thoại của user (backend lấy từ token)
 */
export const getMyConversations = () => API.get("/conversations");

/**
 * 💬 Tạo hoặc lấy cuộc trò chuyện giữa 2 người
 */
export const createOrGetConversation = ({ userA, userB }) =>
  API.post("/conversations", { userA, userB });
