import { supabase } from "@/integrations/supabase/client";
import { db, DexieNotification, withCacheUser } from "@/lib/dexieDb";
import type { Tables } from '@/integrations/supabase/types';

// Re-export the type
export type { DexieNotification };

function toDexieNotification(row: Tables<'notifications'>): DexieNotification {
  if (!row.created_at) {
    throw new Error(`Notification ${row.id} has no creation timestamp`);
  }

  return {
    id: row.id,
    user_id: row.user_id,
    job_id: row.job_id,
    type: row.type,
    message: row.message,
    payload: typeof row.payload === 'object' && row.payload !== null && !Array.isArray(row.payload)
      ? row.payload as Record<string, unknown>
      : {},
    read: row.read ?? false,
    snoozed_until: row.snoozed_until,
    created_at: row.created_at,
  };
}

// Sync notifications from Supabase to Dexie
export async function syncNotifications(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, job_id, type, message, payload, read, snoozed_until, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  if (!data) throw new Error("Notification sync returned no data");

  const notifications = data.map(toDexieNotification);
  await withCacheUser(userId, [db.notifications], async () => {
    if (notifications.length > 0) await db.notifications.bulkPut(notifications);
  });
}

export async function addRealtimeNotificationToCache(
  row: Tables<'notifications'>,
  userId: string,
): Promise<void> {
  await addNotificationToCache(toDexieNotification(row), userId);
}

// Add a single notification to Dexie
export async function addNotificationToCache(notification: DexieNotification, userId: string): Promise<void> {
  if (notification.user_id !== userId) {
    throw new Error('Cannot cache a notification for another user');
  }
  await withCacheUser(userId, [db.notifications], () => db.notifications.put(notification));
}

// Mark notification as read in both Supabase and Dexie
export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Notification read state was not updated");

  await withCacheUser(userId, [db.notifications], async () => {
    const cachedNotification = await db.notifications.get(notificationId);
    if (cachedNotification?.user_id === userId) {
      await db.notifications.update(notificationId, { read: true });
    }
  });
}

// Snooze notification for 6 hours
export async function snoozeNotification(notificationId: string, userId: string): Promise<void> {
  const snoozeUntil = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("notifications")
    .update({ snoozed_until: snoozeUntil, read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Notification snooze state was not updated");

  await withCacheUser(userId, [db.notifications], async () => {
    const cachedNotification = await db.notifications.get(notificationId);
    if (cachedNotification?.user_id === userId) {
      await db.notifications.update(notificationId, {
        snoozed_until: snoozeUntil,
        read: true
      });
    }
  });
}

// Get unread, non-snoozed high priority notifications
export async function getActiveHighPriorityNotifications(userId: string): Promise<DexieNotification[]> {
  const now = new Date().toISOString();
  return db.notifications
    .where("user_id")
    .equals(userId)
    .filter((n) => n.type === "high_priority_pending" && !n.read && (!n.snoozed_until || n.snoozed_until < now))
    .toArray();
}
