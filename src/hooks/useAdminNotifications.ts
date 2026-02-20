import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateAdminNotification,
  GetAdminNotifications,
  GetAdminNotificationsParams,
  MarkAdminNotificationRead,
  MarkAllAdminNotificationsRead,
} from "@/services/admin/notifications";
import { AdminNotificationRecord } from "@/types/admin";

export const useAdminNotifications = (
  params: GetAdminNotificationsParams = {}
) => {
  return useQuery({
    queryKey: ["admin-notifications", params],
    queryFn: async () => {
      const response = await GetAdminNotifications(params);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useCreateAdminNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Omit<AdminNotificationRecord, "id" | "created_at" | "createdAt" | "read">
    ) => {
      const response = await CreateAdminNotification(payload);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });
};

export const useMarkAdminNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await MarkAdminNotificationRead(notificationId);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });
};

export const useMarkAllAdminNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await MarkAllAdminNotificationsRead();
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });
};
