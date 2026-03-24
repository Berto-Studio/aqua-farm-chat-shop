import { apiRequest, setAuthSession } from "@/hooks/useClient";
import { useUserStore } from "@/store/store";

export interface RegisterProps {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  user_type: "user" | "worker" | "consumer" | "farmer";
  address?: string;
  profile_image_url?: string;
  date_of_birth: string;
  accept_policy: boolean;
}

interface RegisterResponse {
  data?: {
    access_token?: string;
    csrf_token?: string;
  } | null;
  message?: string;
  status?: number | string;
}

const normalizeRegistrationUserType = (
  userType: RegisterProps["user_type"],
) => {
  if (userType === "consumer") return "user";
  if (userType === "farmer") return "worker";
  return userType;
};

const normalizeResponseStatus = (status?: number | string) => {
  if (typeof status === "string") {
    const parsedStatus = Number(status);
    return Number.isFinite(parsedStatus) ? parsedStatus : undefined;
  }

  return status;
};

const isSuccessfulRegistrationStatus = (status?: number | string) => {
  const normalizedStatus = normalizeResponseStatus(status);
  return (
    normalizedStatus === undefined ||
    (normalizedStatus >= 200 && normalizedStatus < 300)
  );
};

export default async function Register(payload: RegisterProps): Promise<{
  success: boolean;
  message?: string;
  status?: number;
}> {
  const { setLoading } = useUserStore.getState();

  try {
    setLoading(true);

    const response = await apiRequest<RegisterResponse>("auth/register", "POST", {
      ...payload,
      user_type: normalizeRegistrationUserType(payload.user_type),
    });

    const status = normalizeResponseStatus(response.status);
    const { message } = response;

    if (!isSuccessfulRegistrationStatus(status)) {
      return {
        success: false,
        message: message || "Registration failed",
        status,
      };
    }

    // Optional: support registration responses that also issue auth tokens.
    if (response?.data?.access_token) {
      setAuthSession(response.data.access_token, response.data.csrf_token);
    }

    return { success: true, message: "Registration successful", status };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  } finally {
    setLoading(false);
  }
}
