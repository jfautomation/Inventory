import { setToken } from "../api/client";

const API_BASE = "http://jf-auto-inventory-clone-2.local/wp-json";

export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE}/jwt-auth/v1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  });

  const data = await res.json();

  console.log("JWT RESPONSE:", data);

  if (!data.token) {
    throw new Error(data.message || "Login failed");
  }

  setToken(data.token);

  // 👇 ADD IT HERE
  console.log("TOKEN SAVED:", localStorage.getItem("jwt_token"));

  return data;


};
