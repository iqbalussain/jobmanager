import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface AppNotification {
  id: string;
  type: 'high_priority' | 'job_created' | 'status_change' | 'invoice_completed' | 'info';
  message: string;
  jobOrderNumber?: string;
  actionId?: string;
  time: string;
  read: boolean;
}

function isAppNotification(value: unknown): value is AppNotification {
  if (typeof value !== "object" || value === null) return false;
  const notification = value as Record<string, unknown>;
  return typeof notification.id === "string" &&
    ["high_priority", "job_created", "status_change", "invoice_completed", "info"]
      .includes(String(notification.type)) &&
    typeof notification.message === "string" &&
    typeof notification.time === "string" &&
    typeof notification.read === "boolean";
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'time'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const pendingNotifications = useRef(new Map<string, AppNotification[]>());

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setHydratedUserId(null);
      return;
    }

    const storageKey = `jobmanager:local-notifications:${userId}`;
    let loaded: AppNotification[] = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error("Saved notifications are not a list");
        loaded = parsed.filter(isAppNotification);
      }
    } catch (error) {
      console.error("Failed to load saved notifications:", error);
    }
    const pending = pendingNotifications.current.get(userId) || [];
    pendingNotifications.current.delete(userId);
    setNotifications([...pending, ...loaded].slice(0, 50));
    setHydratedUserId(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || hydratedUserId !== userId) return;
    try {
      localStorage.setItem(
        `jobmanager:local-notifications:${userId}`,
        JSON.stringify(notifications),
      );
    } catch (error) {
      console.error("Failed to save local notifications:", error);
    }
  }, [notifications, userId, hydratedUserId]);

  const visibleNotifications = hydratedUserId === userId ? notifications : [];

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'time'>) => {
    if (!userId) return;
    const newNotification: AppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      time: new Date().toISOString(),
    };

    if (hydratedUserId !== userId) {
      const pending = pendingNotifications.current.get(userId) || [];
      if (!newNotification.actionId || !pending.some(
        (savedNotification) => savedNotification.actionId === newNotification.actionId,
      )) {
        pendingNotifications.current.set(userId, [newNotification, ...pending].slice(0, 50));
      }
      return;
    }
    
    setNotifications(prev => {
      if (newNotification.actionId && prev.some(
        notification => notification.actionId === newNotification.actionId,
      )) {
        return prev;
      }
      const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
      return updated;
    });
  }, [userId, hydratedUserId]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      return prev.map(n => n.id === id ? { ...n, read: true } : n);
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications: visibleNotifications,
      addNotification,
      markAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
