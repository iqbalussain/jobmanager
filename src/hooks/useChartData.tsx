import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export function useChartData() {
  const { data: dailyJobData = [], isLoading } = useQuery({
    queryKey: ['daily-job-data'],
    queryFn: async () => {
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
      for (let i = 0; i < 7; i++) {
        const date = subDays(endDate, 6 - i);
        const dateKey = format(date, 'MMM dd');
        jobsByDate[dateKey] = 0;
      }

      // Count jobs for each date
      if (data) {
        data.forEach(job => {
          const jobDate = new Date(job.created_at);
          const dateKey = format(jobDate, 'MMM dd');
          if (jobsByDate.hasOwnProperty(dateKey)) {
            jobsByDate[dateKey]++;
          }
        });
      }
      const chartRows = Object.entries(jobsByDate).map(([day, jobs]) => ({
        day,
        jobs
      }));
      console.log("[ChartData hook] Fetched chart data:", chartRows);
      return chartRows;
    }
  });

  console.log("[ChartData hook] Current chart data state:", dailyJobData, "Loading:", isLoading);

  return {
    dailyJobData,
    isLoading
  };
}
