import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetUserSupportConversation,
  GetUserSupportMessages,
  MarkUserSupportConversationRead,
  SendUserSupportMessage,
} from "@/services/userMessages";

const isMissingConversationError = (message: string) =>
  /not found|no conversation|does not exist|404/i.test(message);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-support-conversation"] });
      queryClient.invalidateQueries({ queryKey: ["user-support-messages"] });
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
      queryClient.invalidateQueries({ queryKey: ["user-support-conversation"] });
      queryClient.invalidateQueries({ queryKey: ["user-support-messages"] });
    },
  });
};
