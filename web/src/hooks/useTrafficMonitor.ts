import { useState, useCallback, useRef } from "react";
import { TrafficStats, Message } from "../types/nats";

interface UseTrafficMonitorReturn {
  /**
   * Whether monitoring is active
   */
  active: boolean;

  /**
   * Traffic statistics per subject
   */
  stats: TrafficStats[];

  /**
   * Start monitoring specific subjects
   */
  start: (subjects: string[]) => Promise<void>;

  /**
   * Stop monitoring
   */
  stop: () => void;

  /**
   * Update stats for a message
   */
  updateStats: (message: Message) => void;

  /**
   * Clear all stats
   */
  clearStats: () => void;
}

/**
 * Hook for managing traffic monitoring
 */
export function useTrafficMonitor(): UseTrafficMonitorReturn {
  const [active, setActive] = useState(false);
  const [stats, setStats] = useState<TrafficStats[]>([]);
  const statsRef = useRef<Map<string, TrafficStats>>(new Map());

  // Update stats for a message
  const updateStats = useCallback((message: Message) => {
    const statsMap = statsRef.current;

    if (!statsMap.has(message.subject)) {
      statsMap.set(message.subject, {
        subject: message.subject,
        count: 0,
        bytes: 0,
        last_seen: message.timestamp,
      });
    }

    const stat = statsMap.get(message.subject)!;
    stat.count++;
    stat.bytes += message.size;
    stat.last_seen = message.timestamp;

    // Convert to array for rendering
    setStats(Array.from(statsMap.values()));
  }, []);

  // Clear all stats
  const clearStats = useCallback(() => {
    statsRef.current.clear();
    setStats([]);
  }, []);

  // Start monitoring
  const start = useCallback(
    async (subjects: string[]) => {
      try {
        // Create SSE connection for traffic monitoring
        const subjectsParam = subjects.join(",");
        const eventSource = new EventSource(
          `/api/core/monitor?subjects=${encodeURIComponent(subjectsParam)}`,
        );

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "stats") {
              // Update stats from server
              setStats(data.stats || []);
            } else if (data.type === "message") {
              // Update stats from individual message
              updateStats({
                subject: data.subject,
                size: data.size || 0,
                timestamp: data.timestamp,
                data: "",
                data_base64: "",
                reply: data.reply,
              });
            }
          } catch (err) {
            console.error("Failed to parse traffic monitor message:", err);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          setActive(false);
        };

        setActive(true);

        // Store for cleanup
        (window as any).__traffic_monitor = eventSource;
      } catch (err) {
        console.error("Failed to start traffic monitor:", err);
      }
    },
    [updateStats],
  );

  // Stop monitoring
  const stop = useCallback(() => {
    const monitor = (window as any).__traffic_monitor;
    if (monitor) {
      monitor.close();
      delete (window as any).__traffic_monitor;
    }
    setActive(false);
  }, []);

  return {
    active,
    stats,
    start,
    stop,
    updateStats,
    clearStats,
  };
}
