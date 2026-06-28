import { useTranslation } from 'react-i18next';
import { MessageSquare, Trash2, CheckCircle, Zap } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import MessageItem from "./MessageItem";
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
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <div className="flex items-center gap-2 px-4 py-2 bg-dark-bg rounded-lg border border-dark-border">
          {sseConnected ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">{t('common.sseConnected')}</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">{t('common.polling')}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoScroll}
            className={`px-4 py-2 rounded-lg transition-colors ${
              autoScroll ? "bg-green-500/20 text-green-400" : "hover:bg-dark-bg"
            }`}
          >
            {t('messages.autoScroll')}: {autoScroll ? t('common.on') : t('common.off')}
          </button>

          <button
            onClick={onClearMessages}
            className="btn-secondary flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t('common.clear')}
          </button>
        </div>
      </div>

      <div className="divide-y divide-dark-border max-h-[60vh] overflow-y-auto">
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
        <div className="p-3 bg-dark-bg border-t border-dark-border text-center text-sm text-dark-muted">
          {t('messages.showingCount', { shown: maxDisplayed, total: messages.length, hidden: messages.length - maxDisplayed })}
        </div>
      )}
    </div>
  );
}
