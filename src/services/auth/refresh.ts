import { apiRequest, setAuthSession } from "@/hooks/useClient";

interface RefreshResponse {
  data?: {
    access_token?: string;
    refresh_token?: string;
    csrf_token?: string;
    requires_retry?: boolean;
    message?: string;
  };
  access_token?: string;
  refresh_token?: string;
  csrf_token?: string;
  message?: string;
  requires_retry?: boolean;
}

const parseRefreshResponse = (response?: RefreshResponse) => {
  const payload =
    response?.data && typeof response.data === "object"
      ? response.data
      : response;

  return {
    accessToken: payload?.access_token,
    refreshToken: payload?.refresh_token,
    csrfToken: payload?.csrf_token,
    requiresRetry: Boolean(payload?.requires_retry ?? response?.requires_retry),
    message: payload?.message || response?.message,
  };
};

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
      {
        skipAuth: true,
        skipRefresh: true,
      }
    );
    let parsed = parseRefreshResponse(response);

    if (!parsed.accessToken) {
      return {
        success: false,
        message: parsed.message || "Refresh token rejected",
        status: 401,
      };
    }

    setAuthSession(parsed.accessToken, parsed.csrfToken, parsed.refreshToken);

    if (parsed.requiresRetry) {
      response = await apiRequest<RefreshResponse>(
        "auth/refresh",
        "POST",
        undefined,
        false,
        {
          skipAuth: true,
          skipRefresh: true,
        }
      );
      parsed = parseRefreshResponse(response);

      if (!parsed.accessToken) {
        return {
          success: false,
          message: parsed.message || "Refresh retry failed",
          status: 401,
        };
      }

      setAuthSession(parsed.accessToken, parsed.csrfToken, parsed.refreshToken);
    }

    return {
      success: true,
      accessToken: parsed.accessToken,
      csrfToken: parsed.csrfToken,
      message: parsed.message || "Session refreshed",
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
