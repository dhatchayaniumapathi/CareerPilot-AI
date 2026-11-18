import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

// Request interceptor: attach JWT token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("careerpilot_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle unauthorized responses
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and token exists, clear expired token
      if (localStorage.getItem("careerpilot_token")) {
        localStorage.removeItem("careerpilot_token");
        localStorage.removeItem("careerpilot_user");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
