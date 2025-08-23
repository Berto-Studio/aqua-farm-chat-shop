import { useQuery } from "@tanstack/react-query";
import { GetAllCart } from "@/services/cart";

export const useCarts = () => {
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
  });

  // Calculate total quantity of items
  const totalCartItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return { cartItems, totalCartItems, isLoading, isError };
};
