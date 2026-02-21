import { apiRequest } from "@/hooks/useClient";
import {
  AdminOrderRecord,
  AdminOrderStats,
  ApiListResponse,
  ApiSingleResponse,
} from "@/types/admin";
import {
  buildQueryString,
  extractListData,
  extractMeta,
  extractSingleData,
} from "./common";

export interface GetAdminOrdersParams {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "date" | "total";
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export const GetAdminOrders = async (
  params: GetAdminOrdersParams = {},
): Promise<ApiListResponse<AdminOrderRecord>> => {
  try {
    const query = buildQueryString(params as Record<string, unknown>);
    const response = await apiRequest<Record<string, any>>(
      `orders${query}`,
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
      message: response.message || "Orders retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch orders",
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

export const GetAdminOrder = async (
  orderId: string | number,
): Promise<ApiSingleResponse<AdminOrderRecord>> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      `orders/${orderId}`,
      "GET",
    );
    const data = extractSingleData<AdminOrderRecord>(response, ["order"]);

    return {
      success: true,
      data,
      message: response.message || "Order retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching admin order:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch order",
      status: 500,
    };
  }
};

export const UpdateAdminOrderStatus = async (
  orderId: string | number,
  status: string,
): Promise<ApiSingleResponse<AdminOrderRecord>> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      `orders/${orderId}/status`,
      "PATCH",
      { status },
    );
    const data = extractSingleData<AdminOrderRecord>(response, ["order"]);

    return {
      success: true,
      data,
      message: response.message || "Order status updated successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error updating admin order status:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
      status: 500,
    };
  }
};

export const GetAdminOrderStats = async (): Promise<
  ApiSingleResponse<AdminOrderStats>
> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      "orders/stats/overview",
      "GET",
    );
    const data = extractSingleData<AdminOrderStats>(response, [
      "stats",
      "data",
    ]);

    return {
      success: true,
      data,
      message: response.message || "Order stats retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching admin order stats:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch order stats",
      status: 500,
    };
  }
};
