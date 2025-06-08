import { apiRequest } from "@/hooks/useClient";

export async function getUsers(): Promise<{
  success: boolean;
  data?: any[];
  message?: string;
  status?: number;
}> {
  try {
    const response = await apiRequest<{
      users: any[];
      status: number; // Adjust the type based on your API response
    }>("users/1", "GET");

    const data = response.users;
    const status = response.status;

    if (!data) {
      return { success: false, message: "No users found", status: 404 };
    }
    if (status !== 200) {
      return {
        success: false,
        message: "Failed to fetch users",
        status: status,
      };
    }
    return {
      success: true,
      data: data,
      message: "Users fetched successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
