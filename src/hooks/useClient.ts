import { useUserStore } from "@/store/store";
import Cookies from "js-cookie";

// src/api/client.ts
const RAW_API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_CSRF_COOKIE = "refresh_csrf_token";
const LEGACY_REFRESH_CSRF_COOKIE = "csrf_refresh_token";
const ACCESS_TOKEN_STORAGE_KEY = "access_token";
const REFRESH_ENDPOINT = "auth/refresh";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type ApiRequestOptions = {
  headers?: HeadersInit;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

let activeRefreshRequest: Promise<boolean> | null = null;

const normalizeEndpoint = (endpoint: string) => endpoint.replace(/^\/+/, "");

const getCookieOptions = (expiresInDays: number) => {
  const isHttps =
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : !import.meta.env.DEV;

  return {
    expires: expiresInDays,
    secure: isHttps,
    sameSite: "Lax" as const,
    path: "/",
  };
};

const resolveApiBaseUrl = () => {
  if (!RAW_API_BASE_URL) return "/api/v1/";

  // In dev we prefer relative API paths so Vite proxy can avoid CORS errors.
  if (import.meta.env.DEV) {
    try {
      const parsed = new URL(RAW_API_BASE_URL);
      const pathname = parsed.pathname.startsWith("/")
        ? parsed.pathname
        : `/${parsed.pathname}`;
      return pathname.endsWith("/") ? pathname : `${pathname}/`;
    } catch {
      // If it's already relative, keep it as-is.
    }
  }

  return RAW_API_BASE_URL;
};

const API_BASE_URL = resolveApiBaseUrl();

const buildUrl = (endpoint: string) => {
  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL
    : `${API_BASE_URL}/`;
  return `${normalizedBase}${normalizeEndpoint(endpoint)}`;
};

const getAccessToken = () => {
  const cookieToken = Cookies.get(ACCESS_TOKEN_COOKIE);
  if (cookieToken) return cookieToken;

  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
};

const getRefreshCsrfToken = () => {
  const cookieToken =
    Cookies.get(REFRESH_CSRF_COOKIE) || Cookies.get(LEGACY_REFRESH_CSRF_COOKIE);
  if (cookieToken) return cookieToken;

  try {
    return (
      localStorage.getItem(REFRESH_CSRF_COOKIE) ||
      localStorage.getItem(LEGACY_REFRESH_CSRF_COOKIE) ||
      undefined
    );
  } catch {
    return undefined;
  }
};

const setRefreshCsrfToken = (csrfToken?: string) => {
  if (!csrfToken) return;

  Cookies.set(REFRESH_CSRF_COOKIE, csrfToken, getCookieOptions(7));

  try {
    localStorage.setItem(REFRESH_CSRF_COOKIE, csrfToken);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

const clearRefreshCsrfToken = () => {
  Cookies.remove(REFRESH_CSRF_COOKIE);
  Cookies.remove(LEGACY_REFRESH_CSRF_COOKIE);

  try {
    localStorage.removeItem(REFRESH_CSRF_COOKIE);
    localStorage.removeItem(LEGACY_REFRESH_CSRF_COOKIE);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

const clearAccessToken = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE);
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

const safeParseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const extractErrorMessage = (
  payload: Record<string, any> | null,
  fallback: string = "Something went wrong"
) => {
  if (!payload) return fallback;

  return payload.message || payload.msg || payload.error || fallback;
};

const shouldAttemptRefresh = (
  statusCode: number,
  payload: Record<string, any> | null
) => {
  if (statusCode !== 401 && statusCode !== 422) return false;

  const message = extractErrorMessage(payload, "").toLowerCase();
  const tokenErrorPatterns = [
    "token has expired",
    "signature has expired",
    "bad authorization header",
    "missing authorization header",
    "jwt",
    "token",
  ];

  const hasSessionContext = Boolean(
    getAccessToken() || getRefreshCsrfToken() || useUserStore.getState().isLoggedIn
  );

  return hasSessionContext && tokenErrorPatterns.some((pattern) => message.includes(pattern));
};

const buildHeaders = (
  endpoint: string,
  isFormData: boolean,
  options: ApiRequestOptions
) => {
  const headers = new Headers(options.headers);
  const normalizedEndpoint = normalizeEndpoint(endpoint);

  const publicAuthEndpoints = new Set([
    "auth/login",
    "auth/register",
    "auth/register-admin",
    REFRESH_ENDPOINT,
  ]);

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth && !publicAuthEndpoints.has(normalizedEndpoint)) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (normalizedEndpoint === REFRESH_ENDPOINT && !headers.has("X-CSRF-TOKEN")) {
    const csrfToken = getRefreshCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-TOKEN", csrfToken);
    }
  }

  return headers;
};

const performRequest = async (
  endpoint: string,
  method: HttpMethod,
  body: unknown,
  isFormData: boolean,
  options: ApiRequestOptions
) => {
  const requestUrl = buildUrl(endpoint);

  try {
    return await fetch(requestUrl, {
      method,
      headers: buildHeaders(endpoint, isFormData, options),
      credentials: "include",
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Failed to reach API (${requestUrl}). Check backend availability and CORS/proxy config.`
      );
    }

    throw error;
  }
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

const clearAuthState = () => {
  clearAccessToken();
  clearRefreshCsrfToken();
  useUserStore.getState().logout();
};

const refreshAccessToken = async (): Promise<boolean> => {
  if (activeRefreshRequest) {
    return activeRefreshRequest;
  }

  activeRefreshRequest = (async () => {
    try {
      const refreshResponse = await performRequest(
        REFRESH_ENDPOINT,
        "POST",
        undefined,
        false,
        { skipAuth: true, skipRefresh: true }
      );

      const refreshPayload = await safeParseJson<Record<string, any>>(refreshResponse);

      if (!refreshResponse.ok || !refreshPayload?.access_token) {
        clearAuthState();
        return false;
      }

      setAuthSession(refreshPayload.access_token, refreshPayload.csrf_token);

      if (refreshPayload.requires_retry) {
        const retryResponse = await performRequest(
          REFRESH_ENDPOINT,
          "POST",
          undefined,
          false,
          { skipAuth: true, skipRefresh: true }
        );

        const retryPayload = await safeParseJson<Record<string, any>>(retryResponse);
        if (!retryResponse.ok || !retryPayload?.access_token) {
          clearAuthState();
          return false;
        }

        setAuthSession(retryPayload.access_token, retryPayload.csrf_token);
      }

      return true;
    } catch (error) {
      clearAuthState();
      return false;
    } finally {
      activeRefreshRequest = null;
    }
  })();

  return activeRefreshRequest;
};

export const setAccessToken = (token: string) => {
  Cookies.set(ACCESS_TOKEN_COOKIE, token, getCookieOptions(1));
  try {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

export const setAuthSession = (accessToken: string, csrfToken?: string) => {
  setAccessToken(accessToken);
  setRefreshCsrfToken(csrfToken);
};

export const clearAuthSession = () => {
  clearAuthState();
};

export const apiRequest = async <T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  isFormData: boolean = false,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const isRefreshEndpoint = normalizedEndpoint === REFRESH_ENDPOINT;

  let response = await performRequest(endpoint, method, body, isFormData, options);

  if (!response.ok) {
    const errorPayload = await safeParseJson<Record<string, any>>(response);

    if (
      !options.skipRefresh &&
      !isRefreshEndpoint &&
      shouldAttemptRefresh(response.status, errorPayload)
    ) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        response = await performRequest(endpoint, method, body, isFormData, options);

        if (response.ok) {
          return parseResponse<T>(response);
        }

        const retryErrorPayload = await safeParseJson<Record<string, any>>(response);
        throw new Error(extractErrorMessage(retryErrorPayload));
      }
    }

    const lowerMessage = extractErrorMessage(errorPayload, "").toLowerCase();
    if (
      (response.status === 401 || response.status === 422) &&
      (lowerMessage.includes("token") ||
        lowerMessage.includes("authorization") ||
        lowerMessage.includes("jwt"))
    ) {
      clearAuthState();
      throw new Error("Session expired. Please log in again.");
    }

    throw new Error(extractErrorMessage(errorPayload));
  }

  return parseResponse<T>(response);
};
