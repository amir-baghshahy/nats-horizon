/**
 * Notification Center Component
 * Displays notifications in-app with real-time updates
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNotifications } from "../store/notifications";
import { Button } from "./ui/Button";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

const icons = {
  success: <CheckCircle className="icon-base text-green-400" />,
  error: <XCircle className="icon-base text-red-400" />,
  warning: <AlertTriangle className="icon-base text-yellow-400" />,
  info: <Info className="icon-base text-blue-400" />,
};

export function NotificationCenter() {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Handle keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-dark-bg/60 transition-colors"
        aria-label={t("common.notifications")}
      >
        <Bell className="icon-md text-dark-text" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-display-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[500px] z-50">
            <Card className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-border">
                <h3 className="font-semibold">{t("common.notifications")}</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={markAllAsRead}
                        icon={<Check className="icon-sm" />}
                      >
                        {t("common.markAllRead")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearAll}
                        icon={<X className="icon-sm" />}
                      ></Button>
                    </>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="icon-lg text-dark-muted/30 mb-3" />
                    <p className="text-display-sm text-dark-muted">
                      {t("common.noNotifications")}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-dark-border/50">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 hover:bg-dark-bg/30 transition-colors cursor-pointer ${
                          !notification.read ? "bg-primary-500/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {icons[notification.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-display-sm font-medium truncate">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-display-xs text-dark-muted mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            {notification.action && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.action?.onClick();
                                }}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="p-1 hover:bg-dark-bg rounded transition-colors"
                          >
                            <X className="icon-sm text-dark-muted" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-dark-border text-center">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-display-xs text-dark-muted hover:text-dark-text transition-colors"
                  >
                    {t("common.close")}
                  </button>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// Compact notification badge for header
export function NotificationBadge() {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  return (
    <Badge
      variant="danger"
      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-display-xs"
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </Badge>
  );
}
