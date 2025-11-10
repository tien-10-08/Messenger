// src/api/authService.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/auth",
});

export const registerUser = async (data) => {
  const res = await API.post("/register", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await API.post("/login", data);
  return res.data;
};
