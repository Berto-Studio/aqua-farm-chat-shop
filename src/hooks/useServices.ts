import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FarmService } from "@/lib/services";
import {
  CreateAdminFarmService,
  DeleteAdminFarmService,
  GetFarmServices,
  UpdateAdminFarmService,
} from "@/services/admin/farmServices";

export const farmServicesQueryKey = ["admin-farm-services"] as const;

export const useFarmServices = () => {
  return useQuery({
    queryKey: farmServicesQueryKey,
    queryFn: async () => {
      const response = await GetFarmServices();
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
    onSuccess: (createdService) => {
      queryClient.setQueryData<FarmService[]>(farmServicesQueryKey, (current) =>
        createdService ? [...(current ?? []), createdService] : current ?? [],
      );
      queryClient.invalidateQueries({ queryKey: farmServicesQueryKey });
    },
  });
};

export const useUpdateAdminFarmService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string | number;
      payload: FarmService;
    }) => {
      const response = await UpdateAdminFarmService(id, payload);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: (updatedService, variables) => {
      queryClient.setQueryData<FarmService[]>(farmServicesQueryKey, (current) =>
        (current ?? []).map((service) =>
          String(service.id ?? service.title) ===
          String(variables.id ?? variables.payload.title)
            ? (updatedService ?? variables.payload)
            : service,
        ),
      );
      queryClient.invalidateQueries({ queryKey: farmServicesQueryKey });
    },
  });
};

export const useDeleteAdminFarmService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await DeleteAdminFarmService(id);
      if (!response.success) throw new Error(response.message);
      return { data: response.data, id };
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<FarmService[]>(farmServicesQueryKey, (current) =>
        (current ?? []).filter((service) => String(service.id) !== String(deletedId)),
      );
      queryClient.invalidateQueries({ queryKey: farmServicesQueryKey });
    },
  });
};
