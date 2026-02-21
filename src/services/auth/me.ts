import { apiRequest } from "@/hooks/useClient";

export interface AuthMeData {
  id: string | number;
  email: string;
  full_name: string;
  user_type?: string;
  is_admin?: number | boolean;
}

interface AuthMeResponse {
  data?: AuthMeData | { user?: AuthMeData; data?: AuthMeData } | null;
  message?: string;
  status?: number;
}

const extractAuthMeUser = (
  payload?: AuthMeResponse["data"]
): AuthMeData | undefined => {
  if (!payload) return undefined;
  if ("id" in (payload as AuthMeData)) return payload as AuthMeData;

  const wrapped = payload as { user?: AuthMeData; data?: AuthMeData };
  return wrapped.user || wrapped.data;
};

export async function getAuthMe(): Promise<{
  success: boolean;
  data?: AuthMeData;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<AuthMeResponse>("auth/me", "GET");
    const userData = extractAuthMeUser(response?.data);

    if (!userData) {
      return {
        success: false,
        message: response?.message || "No authenticated user data found",
        status: 404,
      };
    }

    return {
      success: true,
      data: userData,
      message: response?.message || "Authenticated user retrieved",
      status: response?.status || 200,
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
