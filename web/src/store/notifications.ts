/**
 * Real-time Notification System
 * Provides toast notifications, in-app alerts, and system-wide notifications
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

export const useNotifications = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          id,
          timestamp: Date.now(),
          read: false,
          ...notification,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50
          unreadCount: state.unreadCount + 1,
        }));

        // Auto-dismiss if duration is set
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }

        // Play notification sound (optional)
        if (typeof Audio !== "undefined" && notification.type === "error") {
          // new Audio('/sounds/error.mp3').play().catch(() => {});
        }

        return id;
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: state.notifications.filter((n) => n.id === id && !n.read).length > 0
            ? state.unreadCount - 1
            : state.unreadCount,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: state.notifications.find((n) => n.id === id && !n.read)
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: "nats-notifications",
      partialize: (state) => ({ notifications: state.notifications, unreadCount: state.unreadCount }),
    }
  )
);

// Convenience functions
export const notify = {
  success: (title: string, message?: string, duration?: number) => {
    return useNotifications.getState().addNotification({
      type: "success",
      title,
      message,
      duration: duration || 4000,
    });
  },

  error: (title: string, message?: string, duration?: number) => {
    return useNotifications.getState().addNotification({
      type: "error",
      title,
      message,
      duration: duration || 6000,
    });
  },

  warning: (title: string, message?: string, duration?: number) => {
    return useNotifications.getState().addNotification({
      type: "warning",
      title,
      message,
      duration: duration || 5000,
    });
  },

  info: (title: string, message?: string, duration?: number) => {
    return useNotifications.getState().addNotification({
      type: "info",
      title,
      message,
      duration: duration || 3000,
    });
  },

  persistent: (type: NotificationType, title: string, message?: string, action?: Notification["action"]) => {
    return useNotifications.getState().addNotification({
      type,
      title,
      message,
      duration: 0, // No auto-dismiss
      action,
    });
  },
};
