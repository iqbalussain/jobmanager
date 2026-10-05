import { supabase } from '@/integrations/supabase/client';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';
import type { JobOrderRecord } from '@/types/jobOrder';

export interface JobEditAudit {
  id: string;
  job_id: string;
  job_order_number: string;
  edited_by: string;
  edited_by_name: string | null;
  edited_role: string | null;
  diff: Record<string, { old: string; new: string }>;
  created_at: string;
}

type JobOrderListener = (payload: RealtimePostgresChangesPayload<JobOrderRecord>) => void;
type SubscriptionStatusHandler = (status: string, error?: Error) => void;

let jobOrderChannel: RealtimeChannel | null = null;
let jobOrderUserId: string | null = null;
let jobOrderStatus = '';
const jobOrderListeners = new Map<JobOrderListener, SubscriptionStatusHandler | undefined>();
const notificationChannels = new Map<string, {
  channel: RealtimeChannel;
  listeners: Set<(notification: Tables<'notifications'>) => void>;
}>();

function removeJobOrderChannel(): void {
  if (jobOrderChannel) void supabase.removeChannel(jobOrderChannel);
  jobOrderChannel = null;
  jobOrderUserId = null;
  jobOrderStatus = '';
}

function ensureJobOrderChannel(userId: string): void {
  if (jobOrderChannel && jobOrderUserId === userId) return;
  removeJobOrderChannel();
  jobOrderUserId = userId;
  jobOrderChannel = supabase
    .channel(`job-orders-shared-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'job_orders' },
      (payload) => {
        for (const listener of jobOrderListeners.keys()) {
          listener(payload as RealtimePostgresChangesPayload<JobOrderRecord>);
        }
      },
    )
    .subscribe((status, error) => {
      jobOrderStatus = status;
      for (const onStatus of jobOrderListeners.values()) {
        onStatus?.(status, error);
      }
    });
}

export function subscribeToJobOrderChanges(
  userId: string,
  listener: JobOrderListener,
  onStatus?: SubscriptionStatusHandler,
): () => void {
  jobOrderListeners.set(listener, onStatus);
  ensureJobOrderChannel(userId);
  if (jobOrderStatus === 'SUBSCRIBED') onStatus?.(jobOrderStatus);

  return () => {
    jobOrderListeners.delete(listener);
    if (jobOrderListeners.size === 0) removeJobOrderChannel();
  };
}

export function subscribeToNotifications(
  userId: string,
  listener: (notification: Tables<'notifications'>) => void,
): () => void {
  let entry = notificationChannels.get(userId);
  if (!entry) {
    const listeners = new Set<(notification: Tables<'notifications'>) => void>();
    const channel = supabase
      .channel(`notifications-shared-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          for (const onNotification of listeners) {
            onNotification(payload.new as Tables<'notifications'>);
          }
        },
      )
      .subscribe();
    entry = { channel, listeners };
    notificationChannels.set(userId, entry);
  }
  entry.listeners.add(listener);

  return () => {
    const active = notificationChannels.get(userId);
    if (!active) return;
    active.listeners.delete(listener);
    if (active.listeners.size === 0) {
      void supabase.removeChannel(active.channel);
      notificationChannels.delete(userId);
    }
  };
}

const activityListeners = new Set<(activity: Tables<'activities'>) => void>();
let activityChannel: RealtimeChannel | null = null;

export function subscribeToActivityInserts(
  listener: (activity: Tables<'activities'>) => void,
): () => void {
  activityListeners.add(listener);
  if (!activityChannel) {
    activityChannel = supabase
      .channel('activities-shared')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        (payload) => activityListeners.forEach((onActivity) => onActivity(payload.new as Tables<'activities'>)),
      )
      .subscribe();
  }

  return () => {
    activityListeners.delete(listener);
    if (activityListeners.size === 0 && activityChannel) {
      void supabase.removeChannel(activityChannel);
      activityChannel = null;
    }
  };
}

let editAuditSubscriptionId = 0;

export function subscribeToJobEdits(
  onEvent: (audit: JobEditAudit) => void,
  currentUserId: string,
): () => void {
  const channel = supabase
    .channel(`job-edit-audit-changes-${++editAuditSubscriptionId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'job_edit_audit' },
      (payload) => {
        const audit = payload.new as JobEditAudit;
        if (audit.edited_by !== currentUserId) onEvent(audit);
      },
    )
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('Job edit realtime subscription failed:', error);
      }
    });

  return () => void supabase.removeChannel(channel);
}
