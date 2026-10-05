import { useEffect, useState, useCallback, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexieDb";
import { useAuth } from "@/hooks/useAuth";
import { 
  syncNotifications, 
  markNotificationRead,
  snoozeNotification,
  addRealtimeNotificationToCache,
} from "@/data/notifications";
import { isSyncAvailable } from "@/services/syncService";
import { subscribeToNotifications } from "@/data/realtime";

function playNotificationSound() {
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
    oscillator.onended = () => void audioContext.close();

    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
  } catch (error) {
    console.warn("Could not play notification sound:", error);
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const hasPlayedSound = useRef(false);
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
    const sync = () => {
      if (!isSyncAvailable()) return;
      setNotificationSyncError(null);
      syncNotifications(userId).catch((error: unknown) => {
        console.error("Notification sync failed:", error);
        if (active) {
          setNotificationSyncError(error instanceof Error ? error.message : "Notification sync failed");
        }
      });
    };
    sync();
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      active = false;
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [userId]);
  
  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return;
    let active = true;
    let unsubscribe: (() => void) | null = null;

    const startSubscription = () => {
      if (!active || !isSyncAvailable() || unsubscribe) return;
      unsubscribe = subscribeToNotifications(userId, async (newNotif) => {

            try {
              await addRealtimeNotificationToCache(newNotif, userId);

              if (!active) return;
              setNotificationSyncError(null);
              if (newNotif.type === "high_priority_pending" && !hasPlayedSound.current) {
                playNotificationSound();
                hasPlayedSound.current = true;
              }
            } catch (error) {
              console.error("Realtime notification cache update failed:", error);
              if (active) {
                setNotificationSyncError(error instanceof Error ? error.message : "Notification sync failed");
              }
            }
          });
    };

    const handleAvailabilityChange = () => {
      if (isSyncAvailable()) {
        startSubscription();
      } else if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };

    startSubscription();
    window.addEventListener("online", handleAvailabilityChange);
    window.addEventListener("offline", handleAvailabilityChange);
    document.addEventListener("visibilitychange", handleAvailabilityChange);
    
    return () => {
      active = false;
      window.removeEventListener("online", handleAvailabilityChange);
      window.removeEventListener("offline", handleAvailabilityChange);
      document.removeEventListener("visibilitychange", handleAvailabilityChange);
      unsubscribe?.();
    };
  }, [userId]);
  
  const acknowledgeNotification = useCallback(async (notificationId: string) => {
    if (user) await markNotificationRead(notificationId, user.id);
  }, [user]);
  
  const snoozeNotificationHandler = useCallback(async (notificationId: string) => {
    if (user) await snoozeNotification(notificationId, user.id);
  }, [user]);
  
  return {
    notifications: notifications || [],
    allNotifications: allNotifications || [],
    acknowledgeNotification,
    snoozeNotification: snoozeNotificationHandler,
    unreadCount: allNotifications?.filter((notification) => !notification.read).length || 0,
    notificationSyncError,
  };
}
