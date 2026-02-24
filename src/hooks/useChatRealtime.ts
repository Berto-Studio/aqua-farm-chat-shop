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

const getSocketBaseUrl = () => {
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

const emitJoinRoom = (socket: Socket, room: string) => {
  socket.emit("room:join", { room });
  socket.emit("join_room", { room });
  socket.emit("join", { room });
};

const emitLeaveRoom = (socket: Socket, room: string) => {
  socket.emit("room:leave", { room });
  socket.emit("leave_room", { room });
  socket.emit("leave", { room });
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
      transports: ["websocket", "polling"],
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
      if (role === "admin") {
        emitJoinRoom(socket, "admins");
      }

      if (conversationId) {
        emitJoinRoom(socket, `conversation:${conversationId}`);
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

      if (role === "admin") {
        emitLeaveRoom(socket, "admins");
      }

      if (conversationId) {
        emitLeaveRoom(socket, `conversation:${conversationId}`);
      }

      socket.disconnect();
    };
  }, [enabled, role, conversationId, queryClient]);
};
