import { useQuery } from "@tanstack/react-query";
import {
  GetAdminUser,
  GetAdminUserDetails,
  GetAdminUserDetailsParams,
  GetAdminUserOrders,
  GetAdminUsers,
  GetAdminUsersParams,
} from "@/services/admin/users";

export const useAdminUsers = (params: GetAdminUsersParams = {}) => {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const response = await GetAdminUsers(params);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useAdminUser = (userId?: string | number) => {
  return useQuery({
    queryKey: ["admin-user", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await GetAdminUser(userId!);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useAdminUserDetails = (
  userId?: string | number,
  params: GetAdminUserDetailsParams = {},
) => {
  return useQuery({
    queryKey: ["admin-user-details", userId, params],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await GetAdminUserDetails(userId!, params);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useAdminUserOrders = (userId?: string | number) => {
  return useQuery({
    queryKey: ["admin-user-orders", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await GetAdminUserOrders(userId!);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
