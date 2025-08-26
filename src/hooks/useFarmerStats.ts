import { GetFarmerStats } from "@/services/products";
import { useQuery } from "@tanstack/react-query";

export const useFarmerStats = () => {
  return useQuery({
    queryKey: ["farmer-stats"],
    queryFn: async () => {
      const response = await GetFarmerStats();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
