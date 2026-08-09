import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface SSEEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;

export function useSSE(channel: string) {
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const url = `/api/events?channel=${channel}`;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setConnected(true);
      reconnectAttempts.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent;

        switch (data.type) {
          case "stream:update": {
            const { name, messages, consumers } = data.data as Record<string, any>;
            queryClient.setQueryData(["streams"], (old: any) => {
              if (!Array.isArray(old)) return old;
              return old.map((stream: any) =>
                stream.config?.name === name
                  ? {
                      ...stream,
                      state: {
                        ...stream.state,
                        messages: messages ?? stream.state?.messages,
                        consumers: consumers ?? stream.state?.consumers,
                      },
                    }
                  : stream,
              );
            });
            queryClient.setQueryData(["stream", name], (old: any) => {
              if (!old) return old;
              return {
                ...old,
                state: {
                  ...old.state,
                  messages: messages ?? old.state?.messages,
                  consumers: consumers ?? old.state?.consumers,
                },
              };
            });
            break;
          }
          case "consumer:update": {
            const { name, stream, lag, num_pending } = data.data as Record<string, any>;
            queryClient.setQueryData(["consumers"], (old: any) => {
              if (!Array.isArray(old)) return old;
              return old.map((consumer: any) =>
                consumer.name === name
                  ? { ...consumer, lag, num_pending, stream: stream ?? consumer.stream }
                  : consumer,
              );
            });
            queryClient.setQueryData(["consumer", name], (old: any) => {
              if (!old) return old;
              return { ...old, lag, num_pending, stream: stream ?? old.stream };
            });
            break;
          }
          case "dashboard:update": {
            const update = data.data as Record<string, any>;
            queryClient.setQueryData(["dashboardStats"], (old: any) => {
              if (!old) return old;
              return { ...old, ...update };
            });
            break;
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE error, reconnecting...");
      setConnected(false);
      eventSource.close();
      eventSourceRef.current = null;
      const delay = Math.min(
        RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts.current),
        RECONNECT_MAX_DELAY,
      );
      reconnectAttempts.current++;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    eventSourceRef.current = eventSource;
  }, [channel, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [channel, connect]);

  return { connected };
}
