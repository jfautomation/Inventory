import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

console.log("API Base URL:", API_BASE);

// Get token directly from storage (always fresh, no stale memory)
export const getToken = () => {
  return localStorage.getItem("jwt_token");
};

export const setToken = (token: string) => {
  localStorage.setItem("jwt_token", token);
};

export const clearToken = () => {
  localStorage.removeItem("jwt_token");
};

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});