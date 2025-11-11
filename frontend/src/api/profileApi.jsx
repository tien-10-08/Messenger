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

export const getMyProfile = async () => {
  const res = await API.get(`/profile/me`);
  return res.data.data;
};

export const getProfile = async (userId) => {
  const res = await API.get(`/profile/${userId}`);
  return res.data.data;
};

export const updateProfile = async (_userIdIgnored, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const res = await API.patch(`/profile/update`, data, isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined);
  return res.data.data;
};
