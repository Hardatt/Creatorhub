import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

// Attach stored token on every request (in case header wasn't set yet)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling – redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
