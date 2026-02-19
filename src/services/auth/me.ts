import { apiRequest } from "@/hooks/useClient";

export interface AuthMeData {
  id: string | number;
  email: string;
  full_name: string;
  user_type?: string;
  is_admin?: number | boolean;
}

interface AuthMeResponse {
  data: AuthMeData | null;
}

export async function getAuthMe(): Promise<{
  success: boolean;
  data?: AuthMeData;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<AuthMeResponse>("auth/me", "GET");

    if (!response?.data) {
      return {
        success: false,
        message: "No authenticated user data found",
        status: 404,
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Authenticated user retrieved",
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch authenticated user",
      status: 500,
    };
  }
}
