import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import { Clock3, Send } from "lucide-react";

interface CustomerServiceChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
  supportName?: string;
  responseTimeLabel?: string;
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);

const formatDayLabel = (date: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dateString = date.toDateString();
  if (dateString === today.toDateString()) return "Today";
  if (dateString === yesterday.toDateString()) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function CustomerServiceChat({
  messages,
  onSendMessage,
  currentUserId,
  supportName = "Customer Support",
  responseTimeLabel = "Replies usually in a few minutes",
}: CustomerServiceChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content) return;

    onSendMessage(content);
    setNewMessage("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-slate-50/80">
      <div className="border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border bg-emerald-50">
              <AvatarFallback className="text-emerald-700">CS</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {supportName}
              </p>
              <p className="text-xs text-slate-500">
                Messages are sent directly to admin.
              </p>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="hidden items-center gap-1 sm:flex"
          >
            <Clock3 className="h-3 w-3" />
            {responseTimeLabel}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white p-4 text-sm text-slate-500">
              Start a conversation with customer support.
            </div>
          ) : null}

          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            const showDayDivider =
              index === 0 ||
              !isSameDay(message.timestamp, messages[index - 1].timestamp);

            return (
              <div key={message.id} className="space-y-2">
                {showDayDivider ? (
                  <div className="flex items-center gap-3 py-1">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {formatDayLabel(message.timestamp)}
                    </span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                ) : null}

                <div
                  className={cn(
                    "flex items-end gap-2",
                    isCurrentUser ? "justify-end" : "justify-start",
                  )}
                >
                  {!isCurrentUser ? (
                    <Avatar className="mb-1 h-7 w-7 border bg-white">
                      <AvatarFallback className="text-[10px] text-slate-600">
                        CS
                      </AvatarFallback>
                    </Avatar>
                  ) : null}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      isCurrentUser
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-800",
                    )}
                  >
                    {!isCurrentUser ? (
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        {supportName}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        isCurrentUser
                          ? "text-primary-foreground/70"
                          : "text-slate-500",
                      )}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t bg-white p-3">
        <div className="flex items-end gap-2 border-slate-200 bg-slate-50 border rounded-lg px-3 py-2">
          <Textarea
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Describe your issue or question..."
            className="min-h-11 max-h-28 resize-none bg-none border-none bg-slate-50 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
