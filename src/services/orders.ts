import { apiRequest } from "@/hooks/useClient";
import { ResponseProps } from "@/types/product";

export default async function GetOrders(): Promise<{
  success: boolean;
  data?: OrderProps[];
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ResponseProps<OrderProps[]>>(
      "orders",
      "GET"
    );
    return {
      success: true,
      data: response.data,
      message: response.message || "Orders retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch orders",
      status: 500,
    };
  }
}

export async function GetOrder(id: string): Promise<{
  success: boolean;
  data?: OrderProps;
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ResponseProps<OrderProps>>(
      `orders/${id}`,
      "GET"
    );
    return {
      success: true,
      data: response.data,
      message: response.message || "Order retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      success: false,
      data: undefined,
      message: error instanceof Error ? error.message : "Failed to fetch order",
      status: 500,
    };
  }
}

export async function GetUserOrders(): Promise<{
  success: boolean;
  data?: OrderProps[];
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ResponseProps<OrderProps[]>>(
      `orders/get-user-orders`,
      "GET"
    );
    return {
      success: true,
      data: response.data,
      message: response.message || "User orders retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch user orders",
      status: 500,
    };
  }
}

export async function GetFarmerOrders(): Promise<{
  success: boolean;
  data?: OrderProps[];
  message: string;
  status: number;
}> {
  try {
    const response = await apiRequest<ResponseProps<OrderProps[]>>(
      `orders/get-farmer-orders`,
      "GET"
    );
    return {
      success: true,
      data: response.data,
      message: response.message || "Farmer orders retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch farmer orders",
      status: 500,
    };
  }
}
