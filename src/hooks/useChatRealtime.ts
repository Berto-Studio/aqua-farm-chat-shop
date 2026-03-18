import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";

type ChatRealtimeRole = "admin" | "user";

type UseChatRealtimeOptions = {
  enabled?: boolean;
  role: ChatRealtimeRole;
  conversationId?: string;
};

const ACCESS_TOKEN_COOKIE = "access_token";
const ACCESS_TOKEN_STORAGE_KEY = "access_token";
const RAW_API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const RAW_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const USE_DEV_PROXY =
  import.meta.env.DEV && import.meta.env.VITE_USE_DEV_PROXY === "true";
const USE_PLATFORM_PROXY = import.meta.env.VITE_USE_PLATFORM_PROXY === "true";
const USE_PROXY_TUNNEL = USE_DEV_PROXY || USE_PLATFORM_PROXY;
const SOCKET_TRANSPORTS = USE_PROXY_TUNNEL
  ? (["polling"] as const)
  : (["polling", "websocket"] as const);
const SHOULD_UPGRADE_SOCKET = !USE_PROXY_TUNNEL;

const getSocketBaseUrl = () => {
  // Keep sockets same-origin when a local or deployment proxy is handling requests.
  if (USE_PROXY_TUNNEL) return undefined;

  if (RAW_SOCKET_URL) return RAW_SOCKET_URL;

  if (!RAW_API_BASE_URL) return undefined;

  try {
    return new URL(RAW_API_BASE_URL).origin;
  } catch {
    // Relative API URLs can reuse current origin.
    return undefined;
  }
};

const getAccessToken = () => {
  const cookieToken = Cookies.get(ACCESS_TOKEN_COOKIE);
  if (cookieToken) return cookieToken;

  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
};

const extractConversationId = (payload: Record<string, any> | undefined) => {
  if (!payload) return undefined;

  const directId =
    payload.conversation_id ||
    payload.conversationId ||
    payload.id ||
    payload.conversation?.id;

  return directId ? String(directId) : undefined;
};

const emitJoinConversation = (socket: Socket, conversationId: string) => {
  socket.emit("conversation:join", { conversation_id: conversationId });
};

const emitLeaveConversation = (socket: Socket, conversationId: string) => {
  socket.emit("conversation:leave", { conversation_id: conversationId });
};

export const useChatRealtime = ({
  enabled = true,
  role,
  conversationId,
}: UseChatRealtimeOptions) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const accessToken = getAccessToken();
    const socket = io(getSocketBaseUrl(), {
      path: "/socket.io",
      transports: [...SOCKET_TRANSPORTS],
      upgrade: SHOULD_UPGRADE_SOCKET,
      withCredentials: true,
      auth: accessToken
        ? {
            token: accessToken,
            access_token: accessToken,
            bearer_token: `Bearer ${accessToken}`,
          }
        : undefined,
      query: accessToken ? { token: accessToken } : undefined,
    });

    const invalidateAdminConversationData = (targetConversationId?: string) => {
      queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });

      if (targetConversationId) {
        queryClient.invalidateQueries({
          queryKey: ["admin-conversation-messages", targetConversationId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["admin-conversation-messages"] });
      }
    };

    const invalidateUserConversationData = () => {
      queryClient.invalidateQueries({ queryKey: ["user-support-conversation"] });
      queryClient.invalidateQueries({ queryKey: ["user-support-messages"] });
    };

    const handleEvent = (payload?: Record<string, any>) => {
      const targetConversationId = extractConversationId(payload);

      if (role === "admin") {
        invalidateAdminConversationData(targetConversationId);
        return;
      }

      if (!targetConversationId || !conversationId || targetConversationId === conversationId) {
        invalidateUserConversationData();
      }
    };

    socket.on("connect", () => {
      if (conversationId) {
        emitJoinConversation(socket, conversationId);
      }
    });

    socket.on("conversation:new", handleEvent);
    socket.on("conversation:updated", handleEvent);
    socket.on("message:new", handleEvent);
    socket.on("conversation:read", handleEvent);

    return () => {
      socket.off("conversation:new", handleEvent);
      socket.off("conversation:updated", handleEvent);
      socket.off("message:new", handleEvent);
      socket.off("conversation:read", handleEvent);

      if (conversationId) {
        emitLeaveConversation(socket, conversationId);
      }

      socket.disconnect();
    };
  }, [enabled, role, conversationId, queryClient]);
};
