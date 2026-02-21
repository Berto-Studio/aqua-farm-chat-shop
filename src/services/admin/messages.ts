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
} from "./common";

export const GetAdminConversations = async (): Promise<
  ApiListResponse<AdminConversationRecord>
> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      "admin/messages/conversations",
      "GET",
    );

    const data = extractListData<AdminConversationRecord>(response, [
      "conversations",
    ]);

    return {
      success: true,
      data,
      meta: extractMeta(response, {
        page: 1,
        per_page: data.length || 20,
        total: data.length,
        pages: 1,
      }),
      message: response.message || "Conversations retrieved successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error fetching admin conversations:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch conversations",
      status: 500,
    };
  }
};

export const CreateAdminConversation = async (
  userId: string | number,
): Promise<ApiSingleResponse<AdminConversationRecord>> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      "admin/messages/conversations",
      "POST",
      { user_id: userId },
    );
    const data = extractSingleData<AdminConversationRecord>(response, [
      "conversation",
    ]);

    return {
      success: true,
      data,
      message: response.message || "Conversation created successfully",
      status: response.status || 201,
    };
  } catch (error) {
    console.error("Error creating admin conversation:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
      status: 500,
    };
  }
};

export const GetAdminConversation = async (
  conversationId: string,
): Promise<ApiSingleResponse<AdminConversationRecord>> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      `admin/messages/conversations/${conversationId}`,
      "GET",
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
    console.error("Error fetching admin conversation:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch conversation",
      status: 500,
    };
  }
};

export const GetAdminConversationMessages = async (
  conversationId: string,
  params: { page?: number; per_page?: number } = {},
): Promise<ApiListResponse<AdminMessageRecord>> => {
  try {
    const query = buildQueryString(params as Record<string, unknown>);
    const response = await apiRequest<Record<string, any>>(
      `admin/messages/conversations/${conversationId}/messages${query}`,
      "GET",
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
    console.error("Error fetching admin messages:", error);
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch messages",
      status: 500,
    };
  }
};

export const SendAdminConversationMessage = async (
  conversationId: string,
  content: string,
): Promise<ApiSingleResponse<AdminMessageRecord>> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      `admin/messages/conversations/${conversationId}/messages`,
      "POST",
      { content },
    );
    const data = extractSingleData<AdminMessageRecord>(response, ["message"]);

    return {
      success: true,
      data,
      message: response.message || "Message sent successfully",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error sending admin message:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to send message",
      status: 500,
    };
  }
};

export const MarkAdminConversationRead = async (
  conversationId: string,
): Promise<{ success: boolean; message: string; status: number }> => {
  try {
    const response = await apiRequest<Record<string, any>>(
      `admin/messages/conversations/${conversationId}/read`,
      "POST",
    );

    return {
      success: true,
      message: response.message || "Conversation marked as read",
      status: response.status || 200,
    };
  } catch (error) {
    console.error("Error marking admin conversation read:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark conversation as read",
      status: 500,
    };
  }
};
