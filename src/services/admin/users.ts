import { apiRequest } from "@/hooks/useClient";
import {
  AdminOrderRecord,
  AdminUserRecord,
  ApiListResponse,
  ApiSingleResponse,
} from "@/types/admin";
import {
  buildQueryString,
  extractListData,
  extractMeta,
  extractSingleData,
} from "./common";

export interface GetAdminUsersParams {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  per_page?: number;
}

export const GetAdminUsers = async (
  params: GetAdminUsersParams = {},
): Promise<ApiListResponse<AdminUserRecord>> => {
  try {
    const query = buildQueryString(params as Record<string, unknown>);
    const response = await apiRequest<Record<string, any>>(
      `users${query}`,
      "GET",
    );

    const data = extractListData<AdminUserRecord>(response, ["users"]);
    const meta = extractMeta(response, {
      page: params.page ?? 1,
      per_page: params.per_page ?? (data.length || 20),
      total: data.length,
      pages: 1,
    });

    return {
      success: true,
      data,
      meta,
      message: response.message || "Users retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Failed to fetch users",
      status: 500,
      meta: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 20,
        total: 0,
        pages: 0,
      },
    };
  }
};

export const GetAdminUser = async (
  userId: string | number,
): Promise<ApiSingleResponse<AdminUserRecord>> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      `users/${userId}`,
      "GET",
    );
    const data = extractSingleData<AdminUserRecord>(response, ["user"]);

    return {
      success: true,
      data,
      message: response.message || "User retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch user",
      status: 500,
    };
  }
};

export const GetAdminUserOrders = async (
  userId: string | number,
  params: { page?: number; per_page?: number } = {},
): Promise<ApiListResponse<AdminOrderRecord>> => {
  try {
    const query = buildQueryString(params as Record<string, unknown>);
    const response = await apiRequest<Record<string, any>>(
      `users/${userId}/orders${query}`,
      "GET",
    );

    const data = extractListData<AdminOrderRecord>(response, ["orders"]);
    const meta = extractMeta(response, {
      page: params.page ?? 1,
      per_page: params.per_page ?? (data.length || 20),
      total: data.length,
      pages: 1,
    });

    return {
      success: true,
      data,
      meta,
      message: response.message || "User orders retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching admin user orders:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch user orders",
      status: 500,
      meta: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 20,
        total: 0,
        pages: 0,
      },
    };
  }
};
