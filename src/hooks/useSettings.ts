import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AddSettingsPaymentMethod,
  ChangeSettingsPassword,
  DeleteSettingsPaymentMethod,
  GetSettingsBillingAddress,
  GetSettingsNotifications,
  GetSettingsOverview,
  GetSettingsPaymentMethods,
  GetSettingsProfile,
  ResetSettingsNotifications,
  SetDefaultSettingsPaymentMethod,
  UpdateSettingsBillingAddress,
  UpdateSettingsNotifications,
  UpdateSettingsProfile,
  UploadSettingsAvatar,
} from "@/services/settings";
import { useUserStore } from "@/store/store";
import type {
  AddPaymentMethodPayload,
  BillingAddress,
  ChangePasswordPayload,
  NotificationSettingsPayload,
  PaymentMethod,
  SettingsOverview,
  SettingsProfile,
} from "@/types/settings";

export const settingsQueryKeys = {
  all: ["settings"] as const,
  overview: ["settings", "overview"] as const,
  profile: ["settings", "profile"] as const,
  notifications: ["settings", "notifications"] as const,
  paymentMethods: ["settings", "payments", "methods"] as const,
  billing: ["settings", "payments", "billing"] as const,
};

const toNumericPhone = (value?: string | null) => {
  if (!value) return undefined;
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return undefined;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const syncUserStoreProfile = (profile?: SettingsProfile) => {
  if (!profile) return;

  const { user, setUser } = useUserStore.getState();
  if (!user) return;

  setUser({
    ...user,
    full_name: [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim(),
    email: profile.email,
    phone: profile.phone,
    phone_number: toNumericPhone(profile.phone),
    image_url: profile.avatarUrl || user.image_url,
  });
};

export const useSettingsOverview = () => {
  return useQuery({
    queryKey: settingsQueryKeys.overview,
    queryFn: async () => {
      const response = await GetSettingsOverview();
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      syncUserStoreProfile(response.data.profile || undefined);
      return response.data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useSettingsProfile = () => {
  return useQuery({
    queryKey: settingsQueryKeys.profile,
    queryFn: async () => {
      const response = await GetSettingsProfile();
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      syncUserStoreProfile(response.data);
      return response.data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateSettingsProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<SettingsProfile>) => {
      const response = await UpdateSettingsProfile(payload);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (profile) => {
      syncUserStoreProfile(profile);
      queryClient.setQueryData(settingsQueryKeys.profile, profile);
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.overview });
    },
  });
};

export const useUploadSettingsAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await UploadSettingsAvatar(file);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (profile) => {
      syncUserStoreProfile(profile);
      queryClient.setQueryData(settingsQueryKeys.profile, profile);
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.overview });
    },
  });
};

export const useChangeSettingsPassword = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = await ChangeSettingsPassword(payload);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
  });
};

export const useSettingsNotifications = () => {
  return useQuery({
    queryKey: settingsQueryKeys.notifications,
    queryFn: async () => {
      const response = await GetSettingsNotifications();
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateSettingsNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Record<string, boolean>) => {
      const response = await UpdateSettingsNotifications(settings);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (payload: NotificationSettingsPayload) => {
      queryClient.setQueryData(settingsQueryKeys.notifications, payload);
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.overview });
    },
  });
};

export const useResetSettingsNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await ResetSettingsNotifications();
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (payload: NotificationSettingsPayload) => {
      queryClient.setQueryData(settingsQueryKeys.notifications, payload);
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.overview });
    },
  });
};

export const useSettingsPaymentMethods = () => {
  return useQuery({
    queryKey: settingsQueryKeys.paymentMethods,
    queryFn: async () => {
      const response = await GetSettingsPaymentMethods();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useAddSettingsPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddPaymentMethodPayload) => {
      const response = await AddSettingsPaymentMethod(payload);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.paymentMethods });
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.overview });
    },
  });
};

export const useSetDefaultSettingsPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (methodId: number) => {
      const response = await SetDefaultSettingsPaymentMethod(methodId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.paymentMethods });
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.overview });
    },
  });
};

export const useDeleteSettingsPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (methodId: number) => {
      const response = await DeleteSettingsPaymentMethod(methodId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.paymentMethods });
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.overview });
    },
  });
};

export const useSettingsBillingAddress = () => {
  return useQuery({
    queryKey: settingsQueryKeys.billing,
    queryFn: async () => {
      const response = await GetSettingsBillingAddress();
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateSettingsBillingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BillingAddress) => {
      const response = await UpdateSettingsBillingAddress(payload);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (billing: BillingAddress) => {
      queryClient.setQueryData(settingsQueryKeys.billing, billing);
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.overview });
    },
  });
};
