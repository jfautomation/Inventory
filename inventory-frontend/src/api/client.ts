import axios from "axios";

const API_BASE = "http://jf-auto-inventory-clone-2.test/wp-json";

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
        Accept: "application/json",
        "Content-Type": "application/json",
    },

    // Do not send cookies unless an endpoint actually needs them.
    withCredentials: false,
});

// =========================
// REQUEST INTERCEPTOR
// =========================

api.interceptors.request.use(
    (config) => {

        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

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

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);