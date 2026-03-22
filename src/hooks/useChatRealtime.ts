import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { shouldSuppressChatRealtimeInvalidation } from "@/lib/chatRealtimeSync";

type ChatRealtimeRole = "admin" | "user";

type UseChatRealtimeOptions = {
  enabled?: boolean;
  role: ChatRealtimeRole;
  conversationId?: string;
};

type SocketEventPayload = {
  conversation_id?: string | number;
  conversationId?: string | number;
  id?: string | number;
  conversation?: {
    id?: string | number;
  } | null;
};

const ACCESS_TOKEN_COOKIE = "access_token";
const ACCESS_TOKEN_STORAGE_KEY = "access_token";
const RAW_API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const RAW_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const CHAT_REALTIME_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_CHAT_REALTIME === "true";
const USE_DEV_PROXY =
  import.meta.env.DEV && import.meta.env.VITE_USE_DEV_PROXY === "true";
const SHOULD_FORCE_POLLING =
  import.meta.env.VITE_SOCKET_FORCE_POLLING === "true";
const SOCKET_TRANSPORTS = SHOULD_FORCE_POLLING
  ? (["polling"] as const)
  : (["websocket"] as const);
const INVALIDATION_DEBOUNCE_MS = 120;
const SHARED_SOCKET_DISCONNECT_DELAY_MS = 1000;

let sharedSocket: Socket | null = null;
let sharedSocketSubscribers = 0;
let sharedSocketDisconnectTimer: number | null = null;

const getSocketBaseUrl = () => {
  if (RAW_SOCKET_URL) return RAW_SOCKET_URL;

  // Keep local development same-origin when the Vite proxy is handling requests.
  if (USE_DEV_PROXY) return undefined;

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

const extractConversationId = (payload: SocketEventPayload | undefined) => {
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

const clearScheduledSharedSocketDisconnect = () => {
  if (sharedSocketDisconnectTimer === null || typeof window === "undefined") {
    return;
  }

  window.clearTimeout(sharedSocketDisconnectTimer);
  sharedSocketDisconnectTimer = null;
};

const scheduleSharedSocketDisconnect = () => {
  if (typeof window === "undefined") return;

  clearScheduledSharedSocketDisconnect();
  sharedSocketDisconnectTimer = window.setTimeout(() => {
    sharedSocketDisconnectTimer = null;

    if (sharedSocketSubscribers > 0 || !sharedSocket) {
      return;
    }

    sharedSocket.disconnect();
    sharedSocket = null;
  }, SHARED_SOCKET_DISCONNECT_DELAY_MS);
};

const getSharedSocket = () => {
  clearScheduledSharedSocketDisconnect();

  if (sharedSocket) {
    return sharedSocket;
  }

  const accessToken = getAccessToken();
  sharedSocket = io(getSocketBaseUrl(), {
    path: "/socket.io",
    transports: [...SOCKET_TRANSPORTS],
    withCredentials: true,
    rememberUpgrade: true,
    auth: accessToken
      ? {
          token: accessToken,
          access_token: accessToken,
          bearer_token: `Bearer ${accessToken}`,
        }
      : undefined,
    query: accessToken ? { token: accessToken } : undefined,
  });

  return sharedSocket;
};

export const useChatRealtime = ({
  enabled = true,
  role,
  conversationId,
}: UseChatRealtimeOptions) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const joinedConversationIdRef = useRef<string | null>(null);
  const roleRef = useRef(role);
  const conversationIdRef = useRef(conversationId);
  const pendingAdminConversationIdsRef = useRef<Set<string>>(new Set());
  const shouldInvalidateAllAdminMessagesRef = useRef(false);
  const pendingUserInvalidationRef = useRef(false);
  const invalidateTimerRef = useRef<number | null>(null);

  roleRef.current = role;
  conversationIdRef.current = conversationId;

  useEffect(() => {
    if (!CHAT_REALTIME_ENABLED || !enabled) return;

    const flushInvalidations = () => {
      if (roleRef.current === "admin") {
        queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
        queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });

        if (shouldInvalidateAllAdminMessagesRef.current) {
          queryClient.invalidateQueries({ queryKey: ["admin-conversation-messages"] });
        } else {
          pendingAdminConversationIdsRef.current.forEach((targetConversationId) => {
            queryClient.invalidateQueries({
              queryKey: ["admin-conversation-messages", targetConversationId],
            });
          });
        }

        pendingAdminConversationIdsRef.current = new Set();
        shouldInvalidateAllAdminMessagesRef.current = false;
        return;
      }

      if (pendingUserInvalidationRef.current) {
        queryClient.invalidateQueries({ queryKey: ["user-support-conversation"] });
        queryClient.invalidateQueries({ queryKey: ["user-support-messages"] });
        pendingUserInvalidationRef.current = false;
      }
    };

    const scheduleInvalidationFlush = () => {
      if (invalidateTimerRef.current !== null) {
        window.clearTimeout(invalidateTimerRef.current);
      }

      invalidateTimerRef.current = window.setTimeout(() => {
        invalidateTimerRef.current = null;
        flushInvalidations();
      }, INVALIDATION_DEBOUNCE_MS);
    };

    const socket = getSharedSocket();
    sharedSocketSubscribers += 1;
    socketRef.current = socket;

    const handleConnect = () => {
      const activeConversationId = conversationIdRef.current;

      if (activeConversationId) {
        emitJoinConversation(socket, activeConversationId);
        joinedConversationIdRef.current = activeConversationId;
      }
    };

    const handleEvent = (payload?: SocketEventPayload) => {
      const targetConversationId = extractConversationId(payload);

      if (roleRef.current === "admin") {
        if (
          targetConversationId &&
          shouldSuppressChatRealtimeInvalidation("admin", targetConversationId)
        ) {
          return;
        }

        if (targetConversationId) {
          pendingAdminConversationIdsRef.current.add(targetConversationId);
        } else {
          shouldInvalidateAllAdminMessagesRef.current = true;
        }

        scheduleInvalidationFlush();
        return;
      }

      const activeConversationId = conversationIdRef.current;
      if (
        !targetConversationId ||
        !activeConversationId ||
        targetConversationId === activeConversationId
      ) {
        if (
          targetConversationId &&
          shouldSuppressChatRealtimeInvalidation("user", targetConversationId)
        ) {
          return;
        }

        pendingUserInvalidationRef.current = true;
        scheduleInvalidationFlush();
      }
    };

    socket.on("connect", handleConnect);
    socket.on("conversation:new", handleEvent);
    socket.on("conversation:updated", handleEvent);
    socket.on("message:new", handleEvent);
    socket.on("conversation:read", handleEvent);

    if (socket.connected && conversationIdRef.current) {
      emitJoinConversation(socket, conversationIdRef.current);
      joinedConversationIdRef.current = conversationIdRef.current;
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("conversation:new", handleEvent);
      socket.off("conversation:updated", handleEvent);
      socket.off("message:new", handleEvent);
      socket.off("conversation:read", handleEvent);

      if (joinedConversationIdRef.current) {
        emitLeaveConversation(socket, joinedConversationIdRef.current);
        joinedConversationIdRef.current = null;
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      if (invalidateTimerRef.current !== null) {
        window.clearTimeout(invalidateTimerRef.current);
        invalidateTimerRef.current = null;
      }

      pendingAdminConversationIdsRef.current = new Set();
      shouldInvalidateAllAdminMessagesRef.current = false;
      pendingUserInvalidationRef.current = false;

      sharedSocketSubscribers = Math.max(0, sharedSocketSubscribers - 1);
      if (sharedSocketSubscribers === 0) {
        scheduleSharedSocketDisconnect();
      }
    };
  }, [enabled, queryClient]);

  useEffect(() => {
    if (!CHAT_REALTIME_ENABLED || !enabled) return;

    const socket = socketRef.current;
    if (!socket) return;

    const previousConversationId = joinedConversationIdRef.current;
    const nextConversationId = conversationId ?? null;

    if (previousConversationId && previousConversationId !== nextConversationId) {
      emitLeaveConversation(socket, previousConversationId);
    }

    if (
      socket.connected &&
      nextConversationId &&
      previousConversationId !== nextConversationId
    ) {
      emitJoinConversation(socket, nextConversationId);
    }

    joinedConversationIdRef.current = socket.connected ? nextConversationId : null;
  }, [conversationId, enabled]);
};
