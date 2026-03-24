import { apiRequest, setAuthSession } from "@/hooks/useClient";
import { useUserStore } from "@/store/store";
import { AuthenticatedUser, loginProps, LoginResponse } from "@/types/authentication";

const normalizeUserType = (userType?: string) => {
  if (!userType) return userType;
  if (userType === "worker") return "farmer";
  if (userType === "user") return "consumer";
  return userType;
};

const pickUserFromPayload = (
  payload?: LoginResponse["data"]
): AuthenticatedUser | undefined => {
  if (!payload) return undefined;
  return payload.user || payload.data;
};

const isEnvelopeStatusSuccess = (status?: number) =>
  status === undefined || status === null || status === 200;

const toNumericPhone = (value?: string) => {
  if (!value) return undefined;
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return undefined;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default async function logIn({ email, password }: loginProps): Promise<{
  success: boolean;
  message?: string;
  status?: number;
}> {
  const { setLoading, setUser } = useUserStore.getState();

  try {
    setLoading(true);

    const response = await apiRequest<LoginResponse>("auth/login", "POST", {
      email,
      password,
    });

    const envelopeStatus = response?.status;
    const envelopeMessage = response?.message;
    const payload = response?.data || undefined;
    const token = payload?.access_token;
    const refreshToken = payload?.refresh_token;
    const csrfToken = payload?.csrf_token;
    const userData = pickUserFromPayload(payload);

    if (!isEnvelopeStatusSuccess(envelopeStatus)) {
      return {
        success: false,
        message: envelopeMessage || "Login failed",
        status: envelopeStatus,
      };
    }

    if (!token || !userData) {
      return {
        success: false,
        message:
          envelopeMessage ||
          "Invalid server response: missing access token or user payload",
        status: envelopeStatus || 500,
      };
    }

    setUser({
      id: String(userData.id),
      email: userData.email,
      phone: userData.phone,
      user_type: normalizeUserType(userData.user_type),
      full_name: userData.full_name,
      phone_number: toNumericPhone(userData.phone),
      address: userData.address,
      is_admin: Boolean(userData.is_admin),
      username: userData.username,
      is_active:
        typeof userData.is_active === "boolean"
          ? userData.is_active
          : Boolean(userData.is_active),
    });

    setAuthSession(token, csrfToken, refreshToken);

    return {
      success: true,
      message: envelopeMessage || "Login successful",
      status: envelopeStatus || 200,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  } finally {
    setLoading(false);
  }
}
