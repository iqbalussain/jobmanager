import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, AlertTriangle } from "lucide-react";
import { useNotifications, AppNotification } from "@/contexts/NotificationContext";
import { useGamingMode } from "@/App";
import { cn } from "@/lib/utils";

interface DashboardNotificationsProps {
  notifications?: AppNotification[];
  onNotificationClick?: (id: string) => void;
}

export function DashboardNotifications({ notifications: propNotifications, onNotificationClick }: DashboardNotificationsProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications: contextNotifications, markAsRead, clearNotifications } = useNotifications();
  const { gamingMode } = useGamingMode();
  const g = gamingMode;
  
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
        className={cn(
          "relative transition-all duration-300",
          g && "border-green-400/50 bg-gray-900/50 hover:bg-green-400/10 hover:border-green-400 hover:shadow-[0_0_15px_rgba(0,255,150,0.3)]"
        )}
      >
        <Bell className={cn("w-4 h-4", g && "text-green-400 drop-shadow-[0_0_6px_rgba(0,255,150,0.6)]")} />
        {unreadNotifications > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse",
            g
              ? "bg-green-400 text-gray-900 shadow-[0_0_10px_rgba(0,255,150,0.6)]"
              : "bg-destructive text-destructive-foreground"
          )}>
            {unreadNotifications}
          </span>
        )}
      </Button>
      {showNotifications && (
        <div className={cn(
          "absolute right-0 top-full mt-2 w-80 rounded-lg shadow-xl border z-50 transition-all duration-300",
          g
            ? "bg-gray-900/95 backdrop-blur-xl border-green-400/30 shadow-[0_0_30px_rgba(0,255,150,0.15)]"
            : "bg-background"
        )}>
          <div className={cn(
            "p-4 border-b flex items-center justify-between",
            g && "border-green-400/20"
          )}>
            <h3 className={cn("font-semibold", g ? "text-green-400 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(0,255,150,0.5)]" : "text-foreground")}>
              {g ? "ALERTS" : "Notifications"}
            </h3>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearNotifications}
                className={cn("h-6 px-2 text-xs", g && "text-red-400 hover:bg-red-400/10")}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {g ? "PURGE" : "Clear"}
              </Button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={cn("p-4 text-center text-sm", g ? "text-green-400/50 font-mono" : "text-muted-foreground")}>
                {g ? "NO ALERTS DETECTED" : "No notifications"}
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 border-b cursor-pointer transition-all duration-200",
                    g
                      ? cn("border-green-400/10 hover:bg-green-400/5", !notification.read && "bg-green-400/5")
                      : cn("hover:bg-muted/50", !notification.read && "bg-primary/5")
                  )}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {notification.type === 'high_priority' && (
                      <AlertTriangle className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0",
                        g ? "text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" : "text-orange-500"
                      )} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", g ? "text-green-300 font-mono" : "text-foreground")}>{notification.message}</p>
                      <p className={cn("text-xs mt-1", g ? "text-cyan-400/50 font-mono" : "text-muted-foreground")}>{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <span className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                        g ? "bg-green-400 shadow-[0_0_6px_rgba(0,255,150,0.6)]" : "bg-primary"
                      )} />
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
