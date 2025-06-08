import { apiRequest } from "@/hooks/useClient";
import { useUserStore } from "@/store/store";
import { loginProps } from "@/types/authentication";
import Cookies from "js-cookie";

interface LoginResponse {
  data: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  access_token: string;
  status: number;
  message?: string;
}

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

    const { data, access_token: token, status, message } = response;

    if (status !== 200) {
      return { success: false, message: message || "Login failed", status };
    }

    if (!data || !token) {
      return { success: false, message: "Invalid response from server" };
    }

    // Set user data in store
    setUser({
      id: data.id,
      email: data.email,
      role: data.role,
      full_name: data.name,
    });

    // Store token securely
    Cookies.set("access_token", token, {
      expires: 1,
      secure: true,
      sameSite: "Lax",
    });

    return { success: true, message: "Login successful", status };
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
