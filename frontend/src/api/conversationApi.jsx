import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMyConversations = async () => {
  const res = await API.get("/conversations");
  return res.data.data || []; 
};

// 💬 Tạo hoặc lấy cuộc trò chuyện giữa 2 người
export const createOrGetConversation = async (partnerId) => {
  const res = await API.post("/conversations", { partnerId });
  return res.data.data || res.data; 
};
