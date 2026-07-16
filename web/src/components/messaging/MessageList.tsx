import { useTranslation } from 'react-i18next';
import { MessageSquare, Trash2 } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import MessageItem from "./MessageItem";
import { Button, LiveIndicator } from "../ui";
import type { Message, MessageFormat } from "../../hooks/useMessageList";

interface MessageListProps {
  messages: Message[];
  expandedMessages: Set<number>;
  viewModes: Map<number, MessageFormat["view"]>;
  messageFormats: Map<number, MessageFormat["type"]>;
  sseConnected: boolean;
  autoScroll: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onToggleExpand: (timestamp: number) => void;
  onCycleViewMode: (timestamp: number) => void;
  onCopyMessage: (message: Message) => void;
  onClearMessages: () => void;
  onToggleAutoScroll: () => void;
  maxDisplayed?: number;
}

export default function MessageList({
  messages,
  expandedMessages,
  viewModes,
  messageFormats,
  sseConnected,
  autoScroll,
  messagesEndRef,
  onToggleExpand,
  onCycleViewMode,
  onCopyMessage,
  onClearMessages,
  onToggleAutoScroll,
  maxDisplayed = 50,
}: MessageListProps) {
  const { t } = useTranslation();

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title={t('messages.noMessagesYet')}
        description={t('messages.noMessagesYetDescription')}
      />
    );
  }

  const displayedMessages = [...messages].reverse().slice(0, maxDisplayed);

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between p-4 border-b border-border-default">
        <LiveIndicator connected={sseConnected} />

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoScroll}
            className={`px-4 py-2 rounded-lg transition-colors ${
              autoScroll ? "bg-green-500/20 text-green-400" : "hover:bg-surface-primary"
            }`}
          >
            {t('messages.autoScroll')}: {autoScroll ? t('common.on') : t('common.off')}
          </button>

          <Button variant="secondary" onClick={onClearMessages} icon={<Trash2 className="icon-base" />}>
            {t('common.clear')}
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border-default max-h-[60vh] overflow-y-auto">
        {displayedMessages.map((message) => {
          const timestamp = message.timestamp;
          const isExpanded = expandedMessages.has(timestamp);
          const viewMode = viewModes.get(timestamp) || "pretty";
          const format =
            (messageFormats.get(timestamp) || "text") === "hex"
              ? "text"
              : ((messageFormats.get(timestamp) || "text") as
                  | "json"
                  | "binary"
                  | "text");

          return (
            <MessageItem
              key={timestamp}
              message={message}
              isExpanded={isExpanded}
              viewMode={viewMode}
              format={format}
              onToggleExpand={() => onToggleExpand(timestamp)}
              onCycleViewMode={() => onCycleViewMode(timestamp)}
              onCopy={() => onCopyMessage(message)}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {messages.length > maxDisplayed && (
        <div className="p-3 bg-surface-primary border-t border-border-default text-center text-display-sm text-content-tertiary">
          {t('messages.showingCount', { shown: maxDisplayed, total: messages.length, hidden: messages.length - maxDisplayed })}
        </div>
      )}
    </div>
  );
}
