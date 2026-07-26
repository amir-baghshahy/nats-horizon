import { useEffect, useRef, useState } from "react";
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

  const connect = () => {
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
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent;

        switch (data.type) {
          case "stream:update":
            queryClient.invalidateQueries({ queryKey: ["streams"] });
            queryClient.invalidateQueries({
              queryKey: ["stream", data.data.name],
            });
            break;
          case "consumer:update":
            queryClient.invalidateQueries({ queryKey: ["consumers"] });
            queryClient.invalidateQueries({
              queryKey: ["consumer", data.data.name],
            });
            break;
          case "dashboard:update":
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
            break;
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
  };

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
  }, [channel]);

  return { connected };
}
