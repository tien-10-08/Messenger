import axios from "axios";

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8080";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Return meaningful error messages
    const message =
      error.response?.data?.error ||
      error.message ||
      "Có lỗi xảy ra, vui lòng thử lại";

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export { API_BASE_URL, SOCKET_URL };
