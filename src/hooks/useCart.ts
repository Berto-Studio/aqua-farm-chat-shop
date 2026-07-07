import { useQuery } from "@tanstack/react-query";
import { GetAllCart } from "@/services/cart";

type UseCartsOptions = {
  enabled?: boolean;
};

export const useCarts = (options?: UseCartsOptions) => {
  const {
    data: cartItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["carts"],
    queryFn: async () => {
      const response = await GetAllCart();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true, // ✅ now works
  });

  console.log("Cart Items:", cartItems); // Log the cart items for debugging

  // Calculate total quantity of items
  const totalCartItems =
    cartItems.length > 0
      ? cartItems.reduce((total, item) => total + item.quantity, 0)
      : 0;

  return { cartItems, totalCartItems, isLoading, isError };
};
