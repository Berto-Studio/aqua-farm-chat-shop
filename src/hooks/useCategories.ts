import GetCategories from "@/services/categories";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await GetCategories();

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch categories");
      }

      return response.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
