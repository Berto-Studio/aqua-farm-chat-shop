import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetAdminOrder,
  GetAdminOrders,
  GetAdminOrdersParams,
  GetAdminOrderStats,
  UpdateAdminOrderStatus,
} from "@/services/admin/orders";

export const useAdminOrders = (params: GetAdminOrdersParams = {}) => {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: async () => {
      const response = await GetAdminOrders(params);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useAdminOrder = (orderId?: string | number) => {
  return useQuery({
    queryKey: ["admin-order", orderId],
    enabled: Boolean(orderId),
    queryFn: async () => {
      const response = await GetAdminOrder(orderId!);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useAdminOrderStats = () => {
  return useQuery({
    queryKey: ["admin-order-stats"],
    queryFn: async () => {
      const response = await GetAdminOrderStats();
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAdminOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string | number;
      status: string;
    }) => {
      const response = await UpdateAdminOrderStatus(orderId, status);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-order", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] });
    },
  });
};
