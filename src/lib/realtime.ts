import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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

let channel: RealtimeChannel | null = null;

export function subscribeJobEdits(
  onEvent: (audit: JobEditAudit) => void,
  currentUserId?: string
): () => void {
  channel = supabase
    .channel('job-edit-audit-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'job_edit_audit'
      },
      (payload) => {
        const audit = payload.new as JobEditAudit;
        // Don't notify the user who made the edit
        if (currentUserId && audit.edited_by === currentUserId) return;
        onEvent(audit);
      }
    )
    .subscribe();

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}
