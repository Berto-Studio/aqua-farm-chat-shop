
import GetProducts from "@/services/products";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await GetProducts();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
  });
};
