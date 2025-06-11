
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  user_name?: string;
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const { data: initialActivities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }
      
      return data.map(activity => ({
        ...activity,
        user_name: activity.profiles?.full_name || 'Unknown User'
      }));
    }
  });

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
    }
  }, [initialActivities]);

  useEffect(() => {
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        async (payload) => {
          // Fetch user details for the new activity
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single();

          const newActivity = {
            ...payload.new,
            user_name: userData?.full_name || 'Unknown User'
          } as Activity;

          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    activities,
    isLoading
  };
}
