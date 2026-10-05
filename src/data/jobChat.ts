import { supabase } from '@/integrations/supabase/client';
import { getProfileNames } from '@/data/profiles';
import type { Tables } from '@/integrations/supabase/types';

type JobComment = Tables<'job_order_comments'>;
export type JobCommentWithProfile = Pick<
  JobComment,
  'id' | 'comment' | 'created_by' | 'created_at' | 'job_order_id'
> & { user_profile: { full_name: string } };

export async function listJobComments(jobOrderId: string): Promise<JobCommentWithProfile[]> {
  const pageSize = 500;
  const comments: Array<Pick<
    JobComment,
    'id' | 'comment' | 'created_by' | 'created_at' | 'job_order_id'
  >> = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from('job_order_comments')
      .select('id, comment, created_by, created_at, job_order_id')
      .eq('job_order_id', jobOrderId)
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    comments.push(...data);
    if (data.length < pageSize) break;
  }

  const profileNames = await getProfileNames([
    ...new Set(comments.map((comment) => comment.created_by)),
  ]);
  const names = new Map(profileNames.map((profile) => [profile.id, profile.full_name]));

  return comments.map((comment) => ({
    ...comment,
    user_profile: {
      full_name: names.get(comment.created_by) || 'Unknown User',
    },
  }));
}

export async function createJobComment(jobOrderId: string, createdBy: string, comment: string) {
  const { data, error } = await supabase
    .from('job_order_comments')
    .insert({ job_order_id: jobOrderId, created_by: createdBy, comment })
    .select('id, comment, created_by, created_at, job_order_id')
    .single();

  if (error) throw error;
  const [profile] = await getProfileNames([createdBy]);
  return {
    ...data,
    user_profile: { full_name: profile?.full_name || 'Unknown User' },
  };
}
