import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * 🔍 Tìm user theo keyword (username/email)
 */
export const searchUsers = (keyword = "", page = 1, limit = 10) =>
  API.get(`/users?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`);
