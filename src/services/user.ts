
import { apiRequest } from "@/hooks/useClient";

interface UserResponse {
  data: {
    email: string;
    full_name: string;
  };
  message: string;
  status: number;
}

export async function GetUser(userId: string): Promise<{
  success: boolean;
  data?: { email: string; full_name: string };
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<UserResponse>(`users/${userId}`, "GET");

    return {
      success: true,
      data: response.data,
      message: response.message || "User retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch user",
      status: 500,
    };
  }
}
