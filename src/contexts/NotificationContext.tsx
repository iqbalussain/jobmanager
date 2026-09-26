import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface AppNotification {
  id: string;
  type: 'high_priority' | 'job_created' | 'status_change' | 'info';
  message: string;
  jobOrderNumber?: string;
  time: string;
  read: boolean;
}

interface HighPriorityAlert {
  show: boolean;
  jobOrderNumber: string;
  message: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'time'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  highPriorityAlert: HighPriorityAlert | null;
  showHighPriorityAlert: (jobOrderNumber: string, message?: string) => void;
  closeHighPriorityAlert: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Server-backed notifications and their offline cache are managed by
  // useNotifications. This context only owns transient in-app alerts.
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [highPriorityAlert, setHighPriorityAlert] = useState<HighPriorityAlert | null>(null);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'time'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      time: new Date().toISOString(),
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
      return updated;
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      return prev.map(n => n.id === id ? { ...n, read: true } : n);
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showHighPriorityAlert = useCallback((jobOrderNumber: string, message?: string) => {
    setHighPriorityAlert({
      show: true,
      jobOrderNumber,
      message: message || `⚠ Job ${jobOrderNumber} has been marked as HIGH PRIORITY.`
    });
  }, []);

  const closeHighPriorityAlert = useCallback(() => {
    setHighPriorityAlert(null);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      clearNotifications,
      highPriorityAlert,
      showHighPriorityAlert,
      closeHighPriorityAlert
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
