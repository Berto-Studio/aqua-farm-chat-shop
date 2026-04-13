import { apiRequest } from "@/hooks/useClient";
import { uploadProfileImageToCloudinary } from "@/services/cloudinary";
import type {
  AddPaymentMethodPayload,
  BillingAddress,
  ChangePasswordPayload,
  NotificationSettingsPayload,
  PaymentMethod,
  SettingsOverview,
  SettingsProfile,
} from "@/types/settings";

type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  message: string;
  status: number;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  status?: number;
};

type AvatarUploadResponse = {
  avatarUrl?: string | null;
  profile?: SettingsProfile | null;
};

const RAW_API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const getBackendOrigin = () => {
  if (typeof window === "undefined") return "";

  if (!RAW_API_BASE_URL) {
    return window.location.origin;
  }

  try {
    return new URL(RAW_API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

const resolveBackendUrl = (value?: string | null) => {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("//")) {
    return `${window.location.protocol}${normalized}`;
  }
  if (normalized.startsWith("/")) {
    return `${getBackendOrigin()}${normalized}`;
  }
  return normalized;
};

const normalizeProfile = (profile?: SettingsProfile | null): SettingsProfile | undefined => {
  if (!profile) return undefined;

  return {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
    phone: profile.phone || "",
    bio: profile.bio || "",
    avatarUrl: resolveBackendUrl(profile.avatarUrl),
  };
};

const normalizeNotifications = (
  payload?: NotificationSettingsPayload | null,
): NotificationSettingsPayload | undefined => {
  if (!payload) return undefined;

  return {
    groups: Array.isArray(payload.groups) ? payload.groups : [],
  };
};

const normalizePaymentMethods = (payload?: PaymentMethod[] | null) => {
  if (!Array.isArray(payload)) return [];

  return payload.map((method) => ({
    id: Number(method.id),
    name: method.name || "",
    last4: method.last4 || "",
    maskedNumber: method.maskedNumber || "",
    type: method.type || "card",
    expiry: method.expiry || "",
    isDefault: Boolean(method.isDefault),
  }));
};

const normalizeBillingAddress = (
  payload?: BillingAddress | null,
): BillingAddress | undefined => {
  if (!payload) return undefined;

  return {
    street: payload.street ?? "",
    city: payload.city ?? "",
    state: payload.state ?? "",
    zip: payload.zip ?? "",
    country: payload.country ?? "",
  };
};

const failureResponse = <T>(fallbackMessage: string, error: unknown): ServiceResponse<T> => ({
  success: false,
  message: error instanceof Error ? error.message : fallbackMessage,
  status: 500,
});

export const GetSettingsOverview = async (): Promise<ServiceResponse<SettingsOverview>> => {
  try {
    const response = await apiRequest<ApiEnvelope<SettingsOverview>>("settings", "GET");
    const data = response.data;

    return {
      success: true,
      data: data
        ? {
            profile: normalizeProfile(data.profile) || null,
            notifications:
              normalizeNotifications(data.notifications) || { groups: [] },
            paymentMethods: normalizePaymentMethods(data.paymentMethods),
            billing:
              normalizeBillingAddress(data.billing) || {
                street: "",
                city: "",
                state: "",
                zip: "",
                country: "",
              },
          }
        : undefined,
      message: response.message || "Settings fetched successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to fetch settings", error);
  }
};

export const GetSettingsProfile = async (): Promise<ServiceResponse<SettingsProfile>> => {
  try {
    const response = await apiRequest<ApiEnvelope<SettingsProfile>>(
      "settings/profile",
      "GET",
    );

    return {
      success: true,
      data: normalizeProfile(response.data),
      message: response.message || "Profile fetched successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to fetch settings profile", error);
  }
};

export const UpdateSettingsProfile = async (
  payload: Partial<SettingsProfile>,
): Promise<ServiceResponse<SettingsProfile>> => {
  try {
    const response = await apiRequest<ApiEnvelope<SettingsProfile>>(
      "settings/profile",
      "PATCH",
      payload,
    );

    return {
      success: true,
      data: normalizeProfile(response.data),
      message: response.message || "Profile updated successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to update settings profile", error);
  }
};

export const UploadSettingsAvatar = async (
  file: File,
): Promise<ServiceResponse<SettingsProfile>> => {
  try {
    const uploadedImageUrl = await uploadProfileImageToCloudinary(file);

    const response = await apiRequest<ApiEnvelope<AvatarUploadResponse>>(
      "settings/profile/avatar",
      "POST",
      {
        avatarUrl: uploadedImageUrl,
        image_url: uploadedImageUrl,
      },
    );

    return {
      success: true,
      data: normalizeProfile(response.data?.profile || undefined),
      message: response.message || "Avatar updated successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to upload avatar", error);
  }
};

export const ChangeSettingsPassword = async (
  payload: ChangePasswordPayload,
): Promise<ServiceResponse<Record<string, never>>> => {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, never>>>(
      "settings/profile/password",
      "PATCH",
      payload,
    );

    return {
      success: true,
      data: response.data || {},
      message: response.message || "Password updated successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to update password", error);
  }
};

export const GetSettingsNotifications = async (): Promise<
  ServiceResponse<NotificationSettingsPayload>
> => {
  try {
    const response = await apiRequest<ApiEnvelope<NotificationSettingsPayload>>(
      "settings/notifications",
      "GET",
    );

    return {
      success: true,
      data: normalizeNotifications(response.data),
      message: response.message || "Notification preferences fetched successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to fetch notification preferences", error);
  }
};

export const UpdateSettingsNotifications = async (
  settings: Record<string, boolean>,
): Promise<ServiceResponse<NotificationSettingsPayload>> => {
  try {
    const response = await apiRequest<ApiEnvelope<NotificationSettingsPayload>>(
      "settings/notifications",
      "PATCH",
      { settings },
    );

    return {
      success: true,
      data: normalizeNotifications(response.data),
      message: response.message || "Notification preferences updated successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to update notification preferences", error);
  }
};

export const ResetSettingsNotifications = async (): Promise<
  ServiceResponse<NotificationSettingsPayload>
> => {
  try {
    const response = await apiRequest<ApiEnvelope<NotificationSettingsPayload>>(
      "settings/notifications/reset",
      "POST",
    );

    return {
      success: true,
      data: normalizeNotifications(response.data),
      message: response.message || "Notification preferences reset successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to reset notification preferences", error);
  }
};

export const GetSettingsPaymentMethods = async (): Promise<
  ServiceResponse<PaymentMethod[]>
> => {
  try {
    const response = await apiRequest<ApiEnvelope<PaymentMethod[]>>(
      "settings/payments/methods",
      "GET",
    );

    return {
      success: true,
      data: normalizePaymentMethods(response.data),
      message: response.message || "Payment methods fetched successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to fetch payment methods", error);
  }
};

export const AddSettingsPaymentMethod = async (
  payload: AddPaymentMethodPayload,
): Promise<ServiceResponse<PaymentMethod>> => {
  try {
    const response = await apiRequest<ApiEnvelope<PaymentMethod>>(
      "settings/payments/methods",
      "POST",
      payload,
    );

    return {
      success: true,
      data: response.data,
      message: response.message || "Payment method added successfully",
      status: response.status || 201,
    };
  } catch (error) {
    return failureResponse("Failed to add payment method", error);
  }
};

export const SetDefaultSettingsPaymentMethod = async (
  methodId: number,
): Promise<ServiceResponse<PaymentMethod>> => {
  try {
    const response = await apiRequest<ApiEnvelope<PaymentMethod>>(
      `settings/payments/methods/${methodId}`,
      "PATCH",
      { isDefault: true },
    );

    return {
      success: true,
      data: response.data,
      message: response.message || "Default payment method updated successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to update default payment method", error);
  }
};

export const DeleteSettingsPaymentMethod = async (
  methodId: number,
): Promise<ServiceResponse<{ id: number }>> => {
  try {
    const response = await apiRequest<ApiEnvelope<{ id: number }>>(
      `settings/payments/methods/${methodId}`,
      "DELETE",
    );

    return {
      success: true,
      data: response.data || { id: methodId },
      message: response.message || "Payment method removed successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to remove payment method", error);
  }
};

export const GetSettingsBillingAddress = async (): Promise<
  ServiceResponse<BillingAddress>
> => {
  try {
    const response = await apiRequest<ApiEnvelope<BillingAddress>>(
      "settings/payments/billing",
      "GET",
    );

    return {
      success: true,
      data: normalizeBillingAddress(response.data),
      message: response.message || "Billing address fetched successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to fetch billing address", error);
  }
};

export const UpdateSettingsBillingAddress = async (
  payload: BillingAddress,
): Promise<ServiceResponse<BillingAddress>> => {
  try {
    const response = await apiRequest<ApiEnvelope<BillingAddress>>(
      "settings/payments/billing",
      "PUT",
      payload,
    );

    return {
      success: true,
      data: normalizeBillingAddress(response.data),
      message: response.message || "Billing address updated successfully",
      status: response.status || 200,
    };
  } catch (error) {
    return failureResponse("Failed to update billing address", error);
  }
};
