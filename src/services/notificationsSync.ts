import { supabase } from "@/integrations/supabase/client";
import { db, DexieNotification } from "@/lib/dexieDb";

// Re-export the type
export type { DexieNotification };

// Sync notifications from Supabase to Dexie
export async function syncNotifications(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }
    
    if (data && data.length > 0) {
      const notifications: DexieNotification[] = data.map((n) => ({
        id: n.id,
        user_id: n.user_id,
        job_id: n.job_id,
        type: n.type,
        message: n.message,
        payload: (typeof n.payload === 'object' && n.payload !== null ? n.payload : {}) as Record<string, unknown>,
        read: n.read,
        snoozed_until: n.snoozed_until,
        created_at: n.created_at,
      }));
      
      await db.notifications.bulkPut(notifications);
      console.log(`Synced ${notifications.length} notifications to Dexie`);
    }
  } catch (err) {
    console.error("Error syncing notifications:", err);
  }
}

// Add a single notification to Dexie
export async function addNotificationToCache(notification: DexieNotification): Promise<void> {
  try {
    await db.notifications.put(notification);
  } catch (err) {
    console.error("Error adding notification to cache:", err);
  }
}

// Mark notification as read in both Supabase and Dexie
export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
    
    await db.notifications.update(notificationId, { read: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
  }
}

// Snooze notification for 6 hours
export async function snoozeNotification(notificationId: string): Promise<void> {
  try {
    const snoozeUntil = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    
    await supabase
      .from("notifications")
      .update({ snoozed_until: snoozeUntil, read: true })
      .eq("id", notificationId);
    
    await db.notifications.update(notificationId, { 
      snoozed_until: snoozeUntil,
      read: true 
    });
  } catch (err) {
    console.error("Error snoozing notification:", err);
  }
}

// Get unread, non-snoozed high priority notifications
export async function getActiveHighPriorityNotifications(): Promise<DexieNotification[]> {
  try {
    const now = new Date().toISOString();
    const notifications = await db.notifications
      .where("type")
      .equals("high_priority_pending")
      .filter((n) => !n.read && (!n.snoozed_until || n.snoozed_until < now))
      .toArray();
    
    return notifications;
  } catch (err) {
    console.error("Error getting active notifications:", err);
    return [];
  }
}
