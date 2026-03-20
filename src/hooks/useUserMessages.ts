import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetUserSupportConversation,
  GetUserSupportMessages,
  MarkUserSupportConversationRead,
  SendUserSupportMessage,
} from "@/services/userMessages";
import {
  AdminConversationRecord,
  AdminMessageRecord,
  ApiListResponse,
} from "@/types/admin";

const isMissingConversationError = (message: string) =>
  /not found|no conversation|does not exist|404/i.test(message);

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

export const useUserSupportConversation = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["user-support-conversation"],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const response = await GetUserSupportConversation();

      if (!response.success) {
        if (isMissingConversationError(response.message)) return undefined;
        throw new Error(response.message);
      }

      return response.data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useUserSupportMessages = (
  params: { page?: number; per_page?: number } = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["user-support-messages", params],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const response = await GetUserSupportMessages(params);

      if (!response.success) {
        if (isMissingConversationError(response.message)) {
          return {
            success: true,
            data: [],
            message: "No messages yet.",
            status: 200,
            meta: {
              page: params.page ?? 1,
              per_page: params.per_page ?? 20,
              total: 0,
              pages: 0,
            },
          };
        }
        throw new Error(response.message);
      }

      return response;
    },
    staleTime: 1000 * 20,
    refetchOnWindowFocus: false,
  });
};

export const useSendUserSupportMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await SendUserSupportMessage(content);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: (response) => {
      const nextMessage = response.data;

      queryClient.setQueryData<AdminConversationRecord | undefined>(
        ["user-support-conversation"],
        (existingConversation) => {
          if (!existingConversation) return existingConversation;

          return {
            ...existingConversation,
            latest_message: nextMessage?.content ?? existingConversation.latest_message,
            latestMessage: nextMessage?.content ?? existingConversation.latestMessage,
            last_message_at:
              nextMessage?.created_at ?? existingConversation.last_message_at,
            lastMessageAt:
              nextMessage?.created_at ?? existingConversation.lastMessageAt,
            unread_count: 0,
            unreadCount: 0,
          };
        },
      );

      queryClient.setQueriesData<ApiListResponse<AdminMessageRecord>>(
        { queryKey: ["user-support-messages"] },
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
    },
  });
};

export const useMarkUserSupportConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await MarkUserSupportConversationRead();
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      queryClient.setQueryData<AdminConversationRecord | undefined>(
        ["user-support-conversation"],
        (existingConversation) =>
          existingConversation
            ? {
                ...existingConversation,
                unread_count: 0,
                unreadCount: 0,
              }
            : existingConversation,
      );

      queryClient.setQueriesData<ApiListResponse<AdminMessageRecord>>(
        { queryKey: ["user-support-messages"] },
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
