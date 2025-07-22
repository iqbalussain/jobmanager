
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export function useChartData() {
  const { data: dailyJobData = [], isLoading } = useQuery({
    queryKey: ['daily-job-data'],
    queryFn: async () => {
      // Get data for the last 7 days
      const endDate = new Date();
      const startDate = subDays(endDate, 6);
      
      const { data, error } = await supabase
        .from('job_orders')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching daily job data:', error);
        throw error;
      }

      // Group jobs by date
      const jobsByDate: Record<string, number> = {};
      
      // Initialize all dates with 0
      for (let i = 0; i < 7; i++) {
        const date = subDays(endDate, 6 - i);
        const dateKey = format(date, 'MMM dd');
        jobsByDate[dateKey] = 0;
      }

      // Count jobs for each date
      data.forEach(job => {
        const jobDate = new Date(job.created_at);
        const dateKey = format(jobDate, 'MMM dd');
        if (jobsByDate.hasOwnProperty(dateKey)) {
          jobsByDate[dateKey]++;
        }
      });

      // Convert to chart format
      return Object.entries(jobsByDate).map(([day, jobs]) => ({
        day,
        jobs
      }));
    }
  });

  return {
    dailyJobData,
    isLoading
  };
}
