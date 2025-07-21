
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
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data: initialActivities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async (): Promise<Activity[]> => {
      // First get activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        throw activitiesError;
      }
      
      if (!activitiesData || activitiesData.length === 0) {
        return [];
      }
      
      // Get unique user IDs from activities
      const userIds = [...new Set(activitiesData.map(activity => activity.user_id))];
      
      // Fetch user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without user names if profiles fetch fails
      }
      
      // Create a map of user_id to full_name
      const userNamesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          userNamesMap.set(profile.id, profile.full_name);
        });
      }
      
      // Combine activities with user names
      return activitiesData.map(activity => ({
        ...activity,
        user_name: userNamesMap.get(activity.user_id) || 'Unknown User'
      }));
    }
  });

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
    }
  }, [initialActivities]);

  useEffect(() => {
    if (isSubscribed) return; // Prevent multiple subscriptions

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

    setIsSubscribed(true);

    return () => {
      setIsSubscribed(false);
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array to run only once

  return {
    activities,
    isLoading
  };
}
