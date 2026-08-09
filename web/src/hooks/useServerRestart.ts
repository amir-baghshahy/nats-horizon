import { useEffect, useState, useCallback, useRef } from "react";
import { ConfigService, HealthService } from "../types";

const RESTART_KEY = "nats-setup-restarting";

export function useServerRestart(options?: { onTimeout?: () => void }) {
  const [restarting, setRestarting] = useState(() => {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(RESTART_KEY) === "true"
      : false;
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const pollServerHealth = useCallback(async (maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        const response = await HealthService.getHealth();
        if (response) {
          localStorage.removeItem(RESTART_KEY);
          return true;
        }
      } catch {
        // Server not ready yet
      }
    }
    localStorage.removeItem(RESTART_KEY);
    return false;
  }, []);

  const triggerRestart = useCallback(async () => {
    setRestarting(true);
    localStorage.setItem(RESTART_KEY, "true");
    try {
      await ConfigService.postConfigRestart();
    } catch {
      // Ignore - connection will drop during restart
    }
  }, []);

  useEffect(() => {
    if (restarting) {
      pollServerHealth().then((success) => {
        if (success) {
          window.location.reload();
        } else {
          setRestarting(false);
          optionsRef.current?.onTimeout?.();
        }
      });
    }
  }, [restarting, pollServerHealth]);

  return { restarting, setRestarting, triggerRestart };
}
