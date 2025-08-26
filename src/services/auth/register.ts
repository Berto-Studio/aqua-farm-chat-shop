import { apiRequest } from "@/hooks/useClient";
import { useUserStore } from "@/store/store";
import Cookies from "js-cookie";

export interface RegisterProps {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  user_type: "farmer" | "consumer";
  address?: string;
  profile_image_url?: string;
  date_of_birth: string;
}

export default async function Register(payload: RegisterProps): Promise<{
  success: boolean;
  message?: string;
  status?: number;
}> {
  const { setLoading } = useUserStore.getState();

  try {
    setLoading(true);

    const response = await apiRequest<any>("auth/register", "POST", payload);

    const { status, message } = response;

    if (status !== 201) {
      return {
        success: false,
        message: message || "Registration failed",
        status,
      };
    }

    // Optionally store token if backend issues one (adjust if you add token support)
    if (response.access_token) {
      Cookies.set("access_token", response.access_token, {
        expires: 1,
        secure: true,
        sameSite: "Lax",
      });
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
