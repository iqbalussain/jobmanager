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
  const [showHighPriorityModal, setShowHighPriorityModal] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  
  // Live query for unread high-priority notifications
  const notifications = useLiveQuery(
    async () => {
      if (!user) return [];
      const now = new Date().toISOString();
      return db.notifications
        .where("type")
        .equals("high_priority_pending")
        .filter((n) => !n.read && (!n.snoozed_until || n.snoozed_until < now))
        .toArray();
    },
    [user],
    []
  );
  
  // All notifications for history
  const allNotifications = useLiveQuery(
    async () => {
      if (!user) return [];
      return db.notifications
        .orderBy("created_at")
        .reverse()
        .limit(50)
        .toArray();
    },
    [user],
    []
  );
  
  // Initial sync
  useEffect(() => {
    if (user) {
      syncNotifications(user.id);
    }
  }, [user]);
  
  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;
    
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
          console.log("New notification received:", payload.new);
          const newNotif = payload.new as DexieNotification;
          
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
          });
          
          // Show modal for high priority notifications
          if (newNotif.type === "high_priority_pending") {
            setShowHighPriorityModal(true);
            
            // Play sound if not already played
            if (!hasPlayedSound) {
              playNotificationSound();
              setHasPlayedSound(true);
            }
          }
        }
      )
      .subscribe();
    
    return () => {
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
      console.log("Could not play notification sound:", err);
    }
  }, []);
  
  const acknowledgeNotification = useCallback(async (notificationId: string) => {
    await markNotificationRead(notificationId);
  }, []);
  
  const snoozeNotificationHandler = useCallback(async (notificationId: string) => {
    await snoozeNotification(notificationId);
  }, []);
  
  const acknowledgeAll = useCallback(async () => {
    if (!notifications) return;
    for (const notif of notifications) {
      await markNotificationRead(notif.id);
    }
    setShowHighPriorityModal(false);
  }, [notifications]);
  
  const snoozeAll = useCallback(async () => {
    if (!notifications) return;
    for (const notif of notifications) {
      await snoozeNotification(notif.id);
    }
    setShowHighPriorityModal(false);
    setHasPlayedSound(false);
  }, [notifications]);
  
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
  };
}
