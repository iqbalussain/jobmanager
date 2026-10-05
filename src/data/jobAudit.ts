import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { getProfileNames } from '@/data/profiles';

type JobOrderLog = Tables<'job_order_logs'>;

export type JobOrderLogEntry = Pick<
  JobOrderLog,
  'id' | 'changed_at' | 'changed_by' | 'action' | 'changed_fields'
> & { user_name: string };

export async function listJobOrderLogs(jobOrderId: string): Promise<JobOrderLogEntry[]> {
  const { data: logs, error } = await supabase
    .from('job_order_logs')
    .select('id, changed_at, changed_by, action, changed_fields')
    .eq('job_order_id', jobOrderId)
    .order('changed_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  if (logs.length === 0) return [];

  const profiles = await getProfileNames([...new Set(logs.map((log) => log.changed_by))]);
  const profileNames = new Map(profiles.map((profile) => [profile.id, profile.full_name]));

  return logs.map((log) => ({
    ...log,
    user_name: profileNames.get(log.changed_by) || 'Unknown User',
  }));
}

export async function getJobOrderSnapshot(logId: string) {
  const { data, error } = await supabase
    .from('job_order_logs')
    .select('snapshot')
    .eq('id', logId)
    .single();

  if (error) throw error;
  return data.snapshot;
}

export async function restoreJobOrderFromSnapshot(
  jobOrderId: string,
  logId: string,
): Promise<void> {
  const snapshot = await getJobOrderSnapshot(logId);
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('The selected edit log does not contain a valid job snapshot.');
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...updates } = snapshot;
  await restoreJobOrder(jobOrderId, updates as TablesUpdate<'job_orders'>);
}

export async function restoreJobOrder(
  jobOrderId: string,
  updates: TablesUpdate<'job_orders'>,
): Promise<void> {
  const { error } = await supabase
    .from('job_orders')
    .update(updates)
    .eq('id', jobOrderId);

  if (error) throw error;
}
