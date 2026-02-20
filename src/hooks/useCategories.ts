import GetCategories from "@/services/categories";
import { useQuery } from "@tanstack/react-query";
import {
  DEFAULT_PRODUCT_CATEGORIES,
  mergeProductCategories,
} from "@/constants/categories";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await GetCategories();

      if (!response.success || !Array.isArray(response.data)) {
        return DEFAULT_PRODUCT_CATEGORIES;
      }

      return mergeProductCategories(response.data);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    placeholderData: DEFAULT_PRODUCT_CATEGORIES,
  });
};
