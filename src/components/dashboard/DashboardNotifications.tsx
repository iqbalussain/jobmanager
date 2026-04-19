import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, AlertTriangle } from "lucide-react";
import { useNotifications, AppNotification } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";

interface DashboardNotificationsProps {
  notifications?: AppNotification[];
  onNotificationClick?: (id: string) => void;
}

export function DashboardNotifications({ notifications: propNotifications, onNotificationClick }: DashboardNotificationsProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications: contextNotifications, markAsRead, clearNotifications } = useNotifications();

  const notifications = propNotifications || contextNotifications;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    onNotificationClick?.(id);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadNotifications > 0 && (
          <span className="absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground">
            {unreadNotifications}
          </span>
        )}
      </Button>
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-md border bg-popover text-popover-foreground shadow-lg z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="h-7 px-2 text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 border-b cursor-pointer hover:bg-muted/50",
                    !notification.read && "bg-muted/30"
                  )}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {notification.type === 'high_priority' && (
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-destructive" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
