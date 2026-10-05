import { supabase } from '@/integrations/supabase/client';
import { getProfileNames } from '@/data/profiles';

export interface ActivityRecord {
  id: string;
  user_id: string;
  action: string;
  description: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  user_name: string;
}

export async function listRecentActivities(): Promise<ActivityRecord[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('id, action, description, entity_type, entity_id, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  if (data.length === 0) return [];

  const profiles = await getProfileNames([...new Set(data.map((activity) => activity.user_id))]);
  const names = new Map(profiles.map((profile) => [profile.id, profile.full_name]));
  return data.map((activity) => ({
    ...activity,
    user_name: names.get(activity.user_id) || 'Unknown User',
  }));
}

export async function getActivityUserName(userId: string): Promise<string> {
  const [profile] = await getProfileNames([userId]);
  return profile?.full_name || 'Unknown User';
}
