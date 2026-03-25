import { GetFeaturedProducts, type GetFeaturedProductsParams } from "@/services/products";
import { useQuery } from "@tanstack/react-query";

export const useFeaturedProducts = (
  params: GetFeaturedProductsParams = {},
) => {
  return useQuery({
    queryKey: ["featured-products", params],
    queryFn: async () => {
      const response = await GetFeaturedProducts(params);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
