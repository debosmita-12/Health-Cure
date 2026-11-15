import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Always attach the latest JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hc_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically handles expired tokens / 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthCall = error.config?.url?.includes("/api/auth/login") || error.config?.url?.includes("/api/auth/register");
      if (!isAuthCall) {
        localStorage.removeItem("hc_token");
        localStorage.removeItem("hc_user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
