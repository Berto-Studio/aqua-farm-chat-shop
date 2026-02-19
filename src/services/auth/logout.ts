import { apiRequest, clearAuthSession } from "@/hooks/useClient";

interface LogoutResponse {
  message?: string;
}

export async function logoutUser(): Promise<{
  success: boolean;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<LogoutResponse>("auth/logout", "POST");

    clearAuthSession();
    return {
      success: true,
      message: response.message || "Logged out",
      status: 200,
    };
  } catch (error) {
    clearAuthSession();
    return {
      success: false,
      message: error instanceof Error ? error.message : "Logout failed",
      status: 500,
    };
  }
}
