import { setToken } from "../api/client";

const API_BASE = "http://jf-auto-inventory-clone-2.test/wp-json";

export const login = async (username: string, password: string) => {
  console.log("LOGIN FUNCTION CALLED");
  console.log("USERNAME:", username);
  console.log("API URL:", `${API_BASE}/jwt-auth/v1/token`);

  try {
    console.log("ABOUT TO FETCH");

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

    console.log("FETCH COMPLETED");
    console.log("STATUS:", res.status);

    // Read the raw response first so we can see exactly what WordPress returns
    const raw = await res.text();

    console.log("RAW JWT RESPONSE:", raw);

    // Parse the response as JSON
    const data = JSON.parse(raw);

    console.log("JWT RESPONSE:", data);

    if (!data.token) {
      throw new Error(data.message || "Login failed");
    }

    setToken(data.token);

    console.log("TOKEN SAVED");

    return data;
  } catch (error) {
    console.error("LOGIN FETCH ERROR:", error);
    throw error;
  }
};