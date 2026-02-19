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
}

const normalizeRegistrationUserType = (userType: RegisterProps["user_type"]) => {
  if (userType === "consumer") return "user";
  if (userType === "farmer") return "worker";
  return userType;
};

export default async function Register(payload: RegisterProps): Promise<{
  success: boolean;
  message?: string;
  status?: number;
}> {
  const { setLoading } = useUserStore.getState();

  try {
    setLoading(true);

    const response = await apiRequest<any>("auth/register", "POST", {
      ...payload,
      user_type: normalizeRegistrationUserType(payload.user_type),
    });

    const { status, message } = response;

    if (status !== 200) {
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
