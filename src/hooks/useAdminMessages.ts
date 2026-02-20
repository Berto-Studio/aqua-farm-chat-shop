import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateAdminConversation,
  GetAdminConversation,
  GetAdminConversationMessages,
  GetAdminConversations,
  MarkAdminConversationRead,
  SendAdminConversationMessage,
} from "@/services/admin/messages";

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-conversation-messages", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-conversation-messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });
};
