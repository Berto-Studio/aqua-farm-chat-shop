import { apiRequest, setAuthSession } from "@/hooks/useClient";
import Cookies from "js-cookie";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const CSRF_TOKEN_COOKIE = "csrf_token";

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
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
    const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE);

    let response = await apiRequest<RefreshResponse>(
      "auth/refresh",
      "POST",
      refreshToken ? { refresh_token: refreshToken } : undefined,
      false,
      {
        skipAuth: true,
        skipRefresh: true,
        headers: csrfToken ? { "X-CSRF-TOKEN": csrfToken } : undefined,
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
      const retryRefreshToken = parsed.refreshToken || Cookies.get(REFRESH_TOKEN_COOKIE);
      response = await apiRequest<RefreshResponse>(
        "auth/refresh",
        "POST",
        retryRefreshToken ? { refresh_token: retryRefreshToken } : undefined,
        false,
        {
          skipAuth: true,
          skipRefresh: true,
          headers: csrfToken ? { "X-CSRF-TOKEN": csrfToken } : undefined,
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
