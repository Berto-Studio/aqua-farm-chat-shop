// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const getToken = () => {
  return sessionStorage.getItem("token");
};

export const apiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown,
  isFormData: boolean = false // Add this flag
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    Authorization: `Bearer ${token || ""}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body
      ? isFormData
        ? (body as FormData)
        : JSON.stringify(body)
      : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Something went wrong");
  }

  return res.json();
};
