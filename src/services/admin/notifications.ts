import {
  AdminNotificationRecord,
  ApiListResponse,
  ApiSingleResponse,
} from "@/types/admin";
import {
  buildQueryString,
  extractListData,
  extractMeta,
  extractSingleData,
  requestWithFallback,
} from "./common";

export interface GetAdminNotificationsParams {
  page?: number;
  per_page?: number;
}

export const GetAdminNotifications = async (
  params: GetAdminNotificationsParams = {}
): Promise<ApiListResponse<AdminNotificationRecord>> => {
  try {
    const query = buildQueryString(params as Record<string, unknown>);
    const response = await requestWithFallback(
      [`admin/notifications${query}`, `notifications${query}`],
      "GET"
    );
    const data = extractListData<AdminNotificationRecord>(response, [
      "notifications",
    ]);

    return {
      success: true,
      data,
      meta: extractMeta(response, {
        page: params.page ?? 1,
        per_page: params.per_page ?? (data.length || 20),
        total: data.length,
        pages: 1,
      }),
      message: response.message || "Notifications retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch notifications",
      status: 500,
    };
  }
};

export const CreateAdminNotification = async (
  payload: Omit<AdminNotificationRecord, "id" | "created_at" | "createdAt" | "read">
): Promise<ApiSingleResponse<AdminNotificationRecord>> => {
  try {
    const response = await requestWithFallback(
      ["admin/notifications", "notifications"],
      "POST",
      payload
    );
    const data = extractSingleData<AdminNotificationRecord>(response, [
      "notification",
    ]);

    return {
      success: true,
      data,
      message: response.message || "Notification created successfully",
      status: response.status || 201,
    };
  } catch (error) {
    console.error("Error creating admin notification:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create notification",
      status: 500,
    };
  }
};

export const MarkAdminNotificationRead = async (
  notificationId: string
): Promise<ApiSingleResponse<AdminNotificationRecord>> => {
  try {
    const response = await requestWithFallback(
      [
        `admin/notifications/${notificationId}/read`,
        `notifications/${notificationId}/read`,
      ],
      "PATCH"
    );
    const data = extractSingleData<AdminNotificationRecord>(response, [
      "notification",
    ]);

    return {
      success: true,
      data,
      message: response.message || "Notification marked as read",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error marking admin notification as read:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
      status: 500,
    };
  }
};

export const MarkAllAdminNotificationsRead = async (): Promise<{
  success: boolean;
  message: string;
  status: number;
}> => {
  try {
    const response = await requestWithFallback(
      ["admin/notifications/read-all", "notifications/read-all"],
      "PATCH"
    );

    return {
      success: true,
      message: response.message || "All notifications marked as read",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error marking all admin notifications as read:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read",
      status: 500,
    };
  }
};
