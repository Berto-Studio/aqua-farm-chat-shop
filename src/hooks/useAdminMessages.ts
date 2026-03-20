import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateAdminConversation,
  GetAdminConversation,
  GetAdminConversationMessages,
  GetAdminConversations,
  MarkAdminConversationRead,
  SendAdminConversationMessage,
} from "@/services/admin/messages";
import {
  AdminConversationRecord,
  AdminMessageRecord,
  ApiListResponse,
} from "@/types/admin";
import { suppressChatRealtimeInvalidation } from "@/lib/chatRealtimeSync";

const appendMessageIfMissing = (
  messages: AdminMessageRecord[],
  nextMessage?: AdminMessageRecord,
) => {
  if (!nextMessage) return messages;

  const nextMessageId = String(nextMessage.id);
  if (messages.some((message) => String(message.id) === nextMessageId)) {
    return messages;
  }

  return [...messages, nextMessage];
};

export const useAdminConversations = () => {
  return useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const response = await GetAdminConversations();
      if (!response.success) throw new Error(response.message);
      return response;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};

export const useAdminConversation = (conversationId?: string) => {
  return useQuery({
    queryKey: ["admin-conversation", conversationId],
    enabled: Boolean(conversationId),
    queryFn: async () => {
      const response = await GetAdminConversation(conversationId!);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useAdminConversationMessages = (
  conversationId?: string,
  params: { page?: number; per_page?: number } = {}
) => {
  return useQuery({
    queryKey: ["admin-conversation-messages", conversationId, params],
    enabled: Boolean(conversationId),
    queryFn: async () => {
      const response = await GetAdminConversationMessages(conversationId!, params);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    staleTime: 1000 * 20,
    refetchOnWindowFocus: false,
  });
};

export const useSendAdminConversationMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      const response = await SendAdminConversationMessage(conversationId, content);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: (response, variables) => {
      const nextMessage = response.data;

      suppressChatRealtimeInvalidation("admin", variables.conversationId);

      queryClient.setQueriesData<ApiListResponse<AdminMessageRecord>>(
        { queryKey: ["admin-conversation-messages", variables.conversationId] },
        (existingResponse) => {
          if (!existingResponse || !nextMessage) return existingResponse;

          const nextMessages = appendMessageIfMissing(
            existingResponse.data,
            nextMessage,
          );

          if (nextMessages === existingResponse.data) {
            return existingResponse;
          }

          return {
            ...existingResponse,
            data: nextMessages,
            meta: existingResponse.meta
              ? {
                  ...existingResponse.meta,
                  total: Math.max(existingResponse.meta.total, nextMessages.length),
                }
              : existingResponse.meta,
          };
        },
      );

      queryClient.setQueryData<ApiListResponse<AdminConversationRecord>>(
        ["admin-conversations"],
        (existingResponse) => {
          if (!existingResponse) return existingResponse;

          return {
            ...existingResponse,
            data: existingResponse.data.map((conversation) =>
              String(conversation.id) === variables.conversationId
                ? {
                    ...conversation,
                    latest_message:
                      nextMessage?.content ?? conversation.latest_message,
                    latestMessage:
                      nextMessage?.content ?? conversation.latestMessage,
                    last_message_at:
                      nextMessage?.created_at ?? conversation.last_message_at,
                    lastMessageAt:
                      nextMessage?.created_at ?? conversation.lastMessageAt,
                    unread_count: 0,
                    unreadCount: 0,
                  }
                : conversation,
            ),
          };
        },
      );
    },
  });
};

export const useCreateAdminConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      const response = await CreateAdminConversation(userId);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
    },
  });
};

export const useMarkAdminConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await MarkAdminConversationRead(conversationId);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: (_, conversationId) => {
      suppressChatRealtimeInvalidation("admin", conversationId);

      queryClient.setQueryData<ApiListResponse<AdminConversationRecord>>(
        ["admin-conversations"],
        (existingResponse) => {
          if (!existingResponse) return existingResponse;

          return {
            ...existingResponse,
            data: existingResponse.data.map((conversation) =>
              String(conversation.id) === conversationId
                ? {
                    ...conversation,
                    unread_count: 0,
                    unreadCount: 0,
                  }
                : conversation,
            ),
          };
        },
      );

      queryClient.setQueriesData<ApiListResponse<AdminMessageRecord>>(
        { queryKey: ["admin-conversation-messages", conversationId] },
        (existingResponse) =>
          existingResponse
            ? {
                ...existingResponse,
                data: existingResponse.data.map((message) => ({
                  ...message,
                  is_read: true,
                })),
              }
            : existingResponse,
      );
    },
  });
};
