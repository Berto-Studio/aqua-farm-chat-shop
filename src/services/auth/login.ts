import { apiRequest } from "@/hooks/useClient";
import { useUserStore } from "@/store/store";
import { loginProps } from "@/types/authentication";
import Cookies from "js-cookie";

export default async function logIn({ email, password }: loginProps): Promise<{
  success: boolean;
  message?: string;
  status?: number;
}> {
  try {
    const response = await apiRequest<{
      data: any;
      access_token: string;
      status: any;
    }>("auth/login", "POST", {
      email,
      password,
    });
    const data = response.data;
    const token = response.access_token;
    const status = response.status;

    if (!data) {
      return { success: false, message: "No data received from server" };
    }

    if (data.data !== null) {
      useUserStore.getState().setUser(data);
    }

    if (token) {
      Cookies.set("access_token", token, {
        expires: 1, // expires in 1 day
        secure: true, // HTTPS only
        sameSite: "Lax",
      });
    }

    if (status !== 200) {
      return { success: false, message: "Login failed" };
    }

    return { success: true, message: "Login successful", status: status };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
