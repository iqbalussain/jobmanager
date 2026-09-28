import { supabase } from '@/integrations/supabase/client';

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

let subscriptionId = 0;

export function subscribeJobEdits(
  onEvent: (audit: JobEditAudit) => void,
  currentUserId: string
): () => void {
  const channel = supabase
    .channel(`job-edit-audit-changes-${++subscriptionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'job_edit_audit'
      },
      (payload) => {
        const audit = payload.new as JobEditAudit;
        if (audit.edited_by === currentUserId) return;
        onEvent(audit);
      }
    )
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('Job edit realtime subscription failed:', error);
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
