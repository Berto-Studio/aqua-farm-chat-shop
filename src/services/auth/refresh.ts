import { apiRequest, setAuthSession } from "@/hooks/useClient";

interface RefreshResponse {
  access_token?: string;
  csrf_token?: string;
  message?: string;
  requires_retry?: boolean;
}

export async function refreshAuthSession(): Promise<{
  success: boolean;
  accessToken?: string;
  csrfToken?: string;
  message: string;
  status: number;
}> {
  try {
    let response = await apiRequest<RefreshResponse>(
      "auth/refresh",
      "POST",
      undefined,
      false,
      { skipAuth: true, skipRefresh: true }
    );

    if (!response?.access_token) {
      return {
        success: false,
        message: response?.message || "Refresh token rejected",
        status: 401,
      };
    }

    setAuthSession(response.access_token, response.csrf_token);

    if (response.requires_retry) {
      response = await apiRequest<RefreshResponse>(
        "auth/refresh",
        "POST",
        undefined,
        false,
        { skipAuth: true, skipRefresh: true }
      );

      if (!response?.access_token) {
        return {
          success: false,
          message: response?.message || "Refresh retry failed",
          status: 401,
        };
      }

      setAuthSession(response.access_token, response.csrf_token);
    }

    return {
      success: true,
      accessToken: response.access_token,
      csrfToken: response.csrf_token,
      message: response.message || "Session refreshed",
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to refresh session",
      status: 500,
    };
  }
}
