
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  name: string;
}

export interface Designer {
  id: string;
  name: string;
  phone: string | null;
}

export interface Salesman {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface JobTitle {
  id: string;
  job_title_id: string;
}

export function useDropdownData() {
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      console.log('Customers fetched:', data);
      return data as Customer[];
    }
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      console.log('Fetching designers...');
      const { data, error } = await supabase
        .from('designers')
        .select('id, name, phone')
        .order('name');
      
      if (error) {
        console.error('Error fetching designers:', error);
        throw error;
      }
      console.log('Designers fetched:', data);
      return data as Designer[];
    }
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['salesmen'],
    queryFn: async () => {
      console.log('Fetching salesmen...');
      const { data, error } = await supabase
        .from('salesmen')
        .select('id, name, email, phone')
        .order('name');
      
      if (error) {
        console.error('Error fetching salesmen:', error);
        throw error;
      }
      console.log('Salesmen fetched:', data);
      return data as Salesman[];
    }
  });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      console.log('Fetching job titles...');
      // Use raw SQL query since the table might not be in types yet
      const { data, error } = await supabase
        .rpc('exec_sql', { 
          sql: 'SELECT id, job_title_id FROM public.job_titles ORDER BY job_title_id' 
        }) as { data: JobTitle[], error: any };
      
      if (error) {
        console.error('Error fetching job titles:', error);
        // Fallback to direct table access
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('job_titles' as any)
          .select('id, job_title_id')
          .order('job_title_id');
        
        if (fallbackError) {
          console.error('Fallback error:', fallbackError);
          return [];
        }
        return fallbackData as JobTitle[];
      }
      console.log('Job titles fetched:', data);
      return data;
    }
  });

  console.log('Dropdown data state:', {
    customers: customers.length,
    designers: designers.length,
    salesmen: salesmen.length,
    jobTitles: jobTitles.length,
    isLoading: customersLoading || designersLoading || salesmenLoading || jobTitlesLoading
  });

  return {
    customers,
    designers,
    salesmen,
    jobTitles,
    isLoading: customersLoading || designersLoading || salesmenLoading || jobTitlesLoading
  };
}
