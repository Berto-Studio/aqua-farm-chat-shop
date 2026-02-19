import { apiRequest } from "@/hooks/useClient";

export interface RegisterAdminProps {
  admin_setup_key: string;
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  address?: string;
  profile_image_url?: string;
  user_type?: "admin";
}

interface RegisterAdminResponse {
  data?: {
    user_id: string | number;
  } | null;
  message?: string;
  status?: number;
}

export async function registerAdmin(payload: RegisterAdminProps): Promise<{
  success: boolean;
  data?: { user_id: string | number } | null;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<RegisterAdminResponse>(
      "auth/register-admin",
      "POST",
      {
        ...payload,
        user_type: "admin",
      }
    );

    const status = response.status ?? 201;

    if (status !== 201 && status !== 200) {
      return {
        success: false,
        data: response.data,
        message: response.message || "Admin registration failed",
        status,
      };
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Admin registered successfully",
      status,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to register admin",
      status: 500,
    };
  }
}
