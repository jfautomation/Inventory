import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

if (process.env.NODE_ENV === "development") {
  console.log("API Base URL:", API_BASE);
}

console.log(process.env.REACT_APP_API_BASE);

// =========================
// TOKEN HELPERS
// =========================

export const getToken = () => {
  return localStorage.getItem("jwt_token");
};

export const setToken = (token: string) => {
  localStorage.setItem("jwt_token", token);
};

export const clearToken = () => {
  localStorage.removeItem("jwt_token");
};

// =========================
// AXIOS INSTANCE
// =========================

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// =========================
// REQUEST INTERCEPTOR
// =========================

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================
// RESPONSE INTERCEPTOR
// =========================

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;

    const isAuthError =
      status === 401 ||
      status === 403 ||
      code === "jwt_auth_invalid_token";

    if (isAuthError && !isRedirecting) {
      isRedirecting = true;

      clearToken();

      // prevents double redirect + gives room for future upgrade
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);