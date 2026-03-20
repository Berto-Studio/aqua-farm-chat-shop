import { useEffect, useRef } from "react";

type UseAutoMarkConversationReadOptions = {
  enabled?: boolean;
  conversationId?: string;
  unreadCount?: number;
  onMarkRead: () => void;
};

export const toUnreadCount = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useAutoMarkConversationRead = ({
  enabled = true,
  conversationId,
  unreadCount = 0,
  onMarkRead,
}: UseAutoMarkConversationReadOptions) => {
  const lastAttemptKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !conversationId || unreadCount <= 0) {
      lastAttemptKeyRef.current = null;
      return;
    }

    const attemptKey = `${conversationId}:${unreadCount}`;
    if (lastAttemptKeyRef.current === attemptKey) {
      return;
    }

    lastAttemptKeyRef.current = attemptKey;
    onMarkRead();
  }, [enabled, conversationId, unreadCount, onMarkRead]);
};
