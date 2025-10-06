import axios from "axios";

const API_BASE_URL = "/api"; // menggunakan proxy dev server

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Middleware untuk menambahkan token ke header
// Disabled because using session-based auth
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("pos-auth-token");
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default api;
