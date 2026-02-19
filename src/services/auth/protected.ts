import { apiRequest } from "@/hooks/useClient";

interface ProtectedResponse {
  message?: string;
}

export async function getProtectedAuthMessage(): Promise<{
  success: boolean;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ProtectedResponse>("auth/protected", "GET");

    return {
      success: true,
      message: response.message || "Protected route accessed",
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to access protected route",
      status: 500,
    };
  }
}
