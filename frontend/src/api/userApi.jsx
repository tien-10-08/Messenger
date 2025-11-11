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
 * 🔍 Tìm user theo từ khóa (backend trả { data: [...], pagination })
 */
export const searchUsers = async (keyword) => {
  const res = await API.get(`/users?q=${encodeURIComponent(keyword)}`);
  return res.data.data || []; 
};

export const getUserProfile = async (userId) => {
  const res = await API.get(`/users/${userId}`);
  return res.data.data || {};
};

export const updateUserProfile = async (userId, updates) => {
  const res = await API.put(`/users/${userId}`, updates);
  return res.data?.data || res.data || {};
};
