
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

API.interceptors.request.use(
  (config) => {
    const isLoginRequest = config.url?.includes("login");

    if (!isLoginRequest) {
      const token = localStorage.getItem("access_token")?.trim();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
