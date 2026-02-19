import { apiRequest, setAuthSession } from "@/hooks/useClient";
import { useUserStore } from "@/store/store";
import { loginProps, LoginResponse } from "@/types/authentication";

const normalizeUserType = (userType?: string) => {
  if (!userType) return userType;
  if (userType === "worker") return "farmer";
  if (userType === "user") return "consumer";
  return userType;
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

    const { data, status, message } = response;
    const token = data?.access_token;
    const csrfToken = data?.csrf_token;
    const userData = data?.data;

    if (status !== 200) {
      return { success: false, message: message || "Login failed", status };
    }

    if (!userData || !token) {
      return { success: false, message: "Invalid response from server" };
    }

    // Set user data in store
    setUser({
      id: String(userData.id),
      email: userData.email,
      user_type: normalizeUserType(userData.user_type),
      full_name: userData.full_name,
      phone_number: userData.phone as any,
      address: userData.address,
      is_admin: Boolean(userData.is_admin),
    });

    // Store access token and refresh CSRF token used by auth/refresh.
    setAuthSession(token, csrfToken);

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
