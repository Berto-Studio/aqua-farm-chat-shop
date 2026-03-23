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

  // Calculate total quantity of items
  const totalCartItems = cartItems.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  return { cartItems, totalCartItems, isLoading, isError };
};
