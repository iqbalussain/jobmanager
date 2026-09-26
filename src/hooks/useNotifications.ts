import { useEffect, useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { supabase } from "@/integrations/supabase/client";
import { db, DexieNotification } from "@/lib/dexieDb";
import { useAuth } from "@/hooks/useAuth";
import { 
  syncNotifications, 
  addNotificationToCache,
  markNotificationRead,
  snoozeNotification
} from "@/services/notificationsSync";

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const [showHighPriorityModal, setShowHighPriorityModal] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [notificationSyncError, setNotificationSyncError] = useState<string | null>(null);
  
  // Live query for unread high-priority notifications
  const notifications = useLiveQuery(
    async () => {
      if (!userId) return [];
      const now = new Date().toISOString();
      return db.notifications
        .where("user_id")
        .equals(userId)
        .filter((n) => !n.read && (!n.snoozed_until || n.snoozed_until < now))
        .filter((n) => n.type === "high_priority_pending")
        .toArray();
    },
    [userId],
    []
  );
  
  // All notifications for history
  const allNotifications = useLiveQuery(
    async () => {
      if (!userId) return [];
      const userNotifications = await db.notifications.where("user_id").equals(userId).toArray();
      return userNotifications
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 50);
    },
    [userId],
    []
  );
  
  // Initial sync
  useEffect(() => {
    if (!userId) {
      setNotificationSyncError(null);
      return;
    }
    let active = true;
    setNotificationSyncError(null);
    syncNotifications(userId).catch((error: unknown) => {
      console.error("Notification sync failed:", error);
      if (active) {
        setNotificationSyncError(error instanceof Error ? error.message : "Notification sync failed");
      }
    });
    return () => {
      active = false;
    };
  }, [userId]);
  
  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;
    let active = true;
    
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotif = payload.new as DexieNotification;
          
          try {
            await addNotificationToCache({
              id: newNotif.id,
              user_id: newNotif.user_id,
              job_id: newNotif.job_id,
              type: newNotif.type,
              message: newNotif.message,
              payload: newNotif.payload || {},
              read: newNotif.read,
              snoozed_until: newNotif.snoozed_until,
              created_at: newNotif.created_at,
            }, user.id);

              if (!active) return;
              setNotificationSyncError(null);
              if (newNotif.type === "high_priority_pending") {
              setShowHighPriorityModal(true);

              if (!hasPlayedSound) {
                playNotificationSound();
                setHasPlayedSound(true);
              }
            }
          } catch (error) {
            console.error("Realtime notification cache update failed:", error);
            if (active) {
              setNotificationSyncError(error instanceof Error ? error.message : "Notification sync failed");
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user, hasPlayedSound]);
  
  // Show modal if there are unread high-priority notifications on load
  useEffect(() => {
    if (notifications && notifications.length > 0 && !showHighPriorityModal) {
      setShowHighPriorityModal(true);
    }
  }, [notifications]);
  
  const playNotificationSound = useCallback(() => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
      // Also try to vibrate on mobile
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (err) {
    }
  }, []);
  
  const acknowledgeNotification = useCallback(async (notificationId: string) => {
    if (user) await markNotificationRead(notificationId, user.id);
  }, [user]);
  
  const snoozeNotificationHandler = useCallback(async (notificationId: string) => {
    if (user) await snoozeNotification(notificationId, user.id);
  }, [user]);
  
  const acknowledgeAll = useCallback(async () => {
    if (!notifications) return;
    for (const notif of notifications) {
      if (user) await markNotificationRead(notif.id, user.id);
    }
    setShowHighPriorityModal(false);
  }, [notifications, user]);
  
  const snoozeAll = useCallback(async () => {
    if (!notifications) return;
    for (const notif of notifications) {
      if (user) await snoozeNotification(notif.id, user.id);
    }
    setShowHighPriorityModal(false);
    setHasPlayedSound(false);
  }, [notifications, user]);
  
  const closeModal = useCallback(() => {
    setShowHighPriorityModal(false);
  }, []);
  
  return {
    notifications: notifications || [],
    allNotifications: allNotifications || [],
    showHighPriorityModal,
    closeModal,
    acknowledgeNotification,
    snoozeNotification: snoozeNotificationHandler,
    acknowledgeAll,
    snoozeAll,
    unreadCount: notifications?.length || 0,
    notificationSyncError,
  };
}
