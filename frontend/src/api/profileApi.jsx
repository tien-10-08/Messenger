// src/api/profileApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // ⚠️ đổi đúng port backend
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** 🔹 Lấy profile user */
export const getProfile = (userId, includePrivate = false) =>
  API.get(`/profile/${userId}?includePrivate=${includePrivate}`);

/** 🔹 Cập nhật profile */
export const updateProfile = (userId, data) =>
  API.patch(`/profile/${userId}`, data);
