import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FarmService } from "@/lib/services";
import {
  CreateAdminFarmService,
  GetAdminFarmServices,
} from "@/services/admin/farmServices";

export const useAdminFarmServices = () => {
  return useQuery({
    queryKey: ["admin-farm-services"],
    queryFn: async () => {
      const response = await GetAdminFarmServices();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useCreateAdminFarmService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FarmService) => {
      const response = await CreateAdminFarmService(payload);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-farm-services"] });
    },
  });
};
