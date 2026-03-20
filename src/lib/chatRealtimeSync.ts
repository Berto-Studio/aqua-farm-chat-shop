type ChatRealtimeRole = "admin" | "user";

const realtimeSuppressionExpirations = new Map<string, number>();
const DEFAULT_SUPPRESSION_MS = 1500;

const buildSuppressionKey = (
  role: ChatRealtimeRole,
  conversationId: string,
) => `${role}:${conversationId}`;

export const suppressChatRealtimeInvalidation = (
  role: ChatRealtimeRole,
  conversationId?: string,
  durationMs = DEFAULT_SUPPRESSION_MS,
) => {
  if (!conversationId) return;

  realtimeSuppressionExpirations.set(
    buildSuppressionKey(role, conversationId),
    Date.now() + durationMs,
  );
};

export const shouldSuppressChatRealtimeInvalidation = (
  role: ChatRealtimeRole,
  conversationId?: string,
) => {
  if (!conversationId) return false;

  const suppressionKey = buildSuppressionKey(role, conversationId);
  const expiresAt = realtimeSuppressionExpirations.get(suppressionKey);

  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    realtimeSuppressionExpirations.delete(suppressionKey);
    return false;
  }

  return true;
};
