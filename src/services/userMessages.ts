import { apiRequest } from "@/hooks/useClient";
import {
  AdminConversationRecord,
  AdminMessageRecord,
  ApiListResponse,
  ApiSingleResponse,
} from "@/types/admin";
import {
  buildQueryString,
  extractListData,
  extractMeta,
  extractSingleData,
} from "./admin/common";

export const GetUserSupportConversation = async (): Promise<
  ApiSingleResponse<AdminConversationRecord>
> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      "user/messages/support/conversation",
      "GET"
    );
    const data = extractSingleData<AdminConversationRecord>(response, [
      "conversation",
    ]);

    return {
      success: true,
      data,
      message: response.message || "Conversation retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching support conversation:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch support conversation",
      status: 500,
    };
  }
};

export const GetUserSupportMessages = async (
  params: { page?: number; per_page?: number } = {}
): Promise<ApiListResponse<AdminMessageRecord>> => {
  try {
    const query = buildQueryString(params as Record<string, unknown>);
    const response = await apiRequest<Record<string, any>>(
      `user/messages/support/conversation/messages${query}`,
      "GET"
    );
    const data = extractListData<AdminMessageRecord>(response, ["messages"]);

    return {
      success: true,
      data,
      meta: extractMeta(response, {
        page: params.page ?? 1,
        per_page: params.per_page ?? (data.length || 20),
        total: data.length,
        pages: 1,
      }),
      message: response.message || "Messages retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching support messages:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch support messages",
      status: 500,
    };
  }
};

export const SendUserSupportMessage = async (
  content: string
): Promise<ApiSingleResponse<AdminMessageRecord>> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      "user/messages/support/conversation/messages",
      "POST",
      { content }
    );
    const data = extractSingleData<AdminMessageRecord>(response, ["message"]);

    return {
      success: true,
      data,
      message: response.message || "Message sent successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error sending support message:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to send support message",
      status: 500,
    };
  }
};

export const MarkUserSupportConversationRead = async (): Promise<{
  success: boolean;
  message: string;
  status: number;
}> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      "user/messages/support/conversation/read",
      "POST"
    );

    return {
      success: true,
      message: response.message || "Conversation marked as read",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error marking support conversation as read:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark support conversation as read",
      status: 500,
    };
  }
};
