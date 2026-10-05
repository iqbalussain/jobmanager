
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getActivityUserName, listRecentActivities, type ActivityRecord } from '@/data/activities';
import { subscribeToActivityInserts } from '@/data/realtime';

export function useActivities() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  const { data: initialActivities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: listRecentActivities,
    staleTime: 60_000,
  });

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    const unsubscribe = subscribeToActivityInserts((activity) => {
      void getActivityUserName(activity.user_id).then((userName) => {
          // Fetch user details for the new activity
          const newActivity = {
            ...activity,
            user_name: userName,
          };

          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }).catch((error: unknown) => {
          console.error('Failed to load activity author:', error);
        });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    activities,
    isLoading
  };
}
