import { useUserStore } from "@/store/store";
import Cookies from "js-cookie";

// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const getToken = () => {
  return Cookies.get("access_token");
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body
      ? isFormData
        ? (body as FormData)
        : JSON.stringify(body)
      : undefined,
  });

  if (!response.ok) {
    let errorMessage = "Something went wrong";
    try {
      const error = await response.json();

      //No token
      if (
        response.status === 422 &&
        error.msg ===
          "Bad Authorization header. Expected 'Authorization: Bearer <JWT>'"
      ) {
        Cookies.remove("access_token");
        useUserStore.getState().logout();

        errorMessage = "Session expired. Please log in again.";
      }

      // Expired token
      if (
        response.status === 401 &&
        error.msg &&
        error.msg.toLowerCase().includes("token has expired")
      ) {
        Cookies.remove("access_token");
        useUserStore.getState().logout();

        errorMessage = "Session expired. Please log in again.";
      } else {
        errorMessage = error.message || error.msg || errorMessage;
      }
    } catch (e) {
      // fallback error message
    }

    throw new Error(errorMessage);
  }

  console.log("Success");

  return response.json();
};
