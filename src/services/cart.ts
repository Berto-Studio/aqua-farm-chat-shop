import { apiRequest } from "@/hooks/useClient";
import { ResponseProps } from "@/types/product";

export const GetAllCart = async (): Promise<{
  success: boolean;
  data?: CartProps[];
  message: string;
  status: number;
}> => {
  try {
    const response = await apiRequest<ResponseProps<CartProps[]>>(
      `carts/`,
      "GET"
    );

    return {
      success: true,
      data: response.data || [],
      message: response.message || "Fetched successfully.",
      status: response.status,
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return {
      success: false,
      message: "An error occurred while fetching the cart.",
      status: 500,
    };
  }
};

export const AddToCart = async (
  payload: AddToCartPayload
): Promise<{
  success: boolean;
  message: string;
  status: number;
}> => {
  try {
    const response = await apiRequest<ResponseProps<[]>>(
      `carts/`,
      "POST",
      payload
    );

    return {
      success: true,
      message: response.message || "Item added to cart.",
      status: response.status,
    };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      message: "An error occurred while adding to cart.",
      status: 500,
    };
  }
};

export const DeleteCartItem = async (
  cart_id: number
): Promise<{
  success: boolean;
  message: string;
  status: number;
}> => {
  try {
    const response = await apiRequest<ResponseProps<[]>>(
      `carts/${cart_id}`,
      "DELETE"
    );

    return {
      success: true,
      message: response.message || "Item deleted from cart.",
      status: response.status,
    };
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return {
      success: false,
      message: "An error occurred while deleting the cart item.",
      status: 500,
    };
  }
};

export const UpdateCartItem = async (
  cart_id: string,
  quantity: number
): Promise<{
  success: boolean;
  message: string;
  status: number;
  data?: CartProps;
}> => {
  try {
    const response = await apiRequest<ResponseProps<CartProps>>(
      `carts/${cart_id}`,
      "PUT",
      { quantity }
    );

    return {
      success: true,
      message: response.message || "Cart item updated.",
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return {
      success: false,
      message: "An error occurred while updating the cart item.",
      status: 500,
    };
  }
};
