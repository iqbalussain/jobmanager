
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Designer, Salesman, JobTitle } from '@/types/jobOrder';

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
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - customers don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['users-designers'],
    queryFn: async () => {
      console.log('Fetching designers with optimized query...');
      
      // Single optimized query using LEFT JOIN
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          phone,
          role,
          user_roles!inner(role)
        `)
        .or('role.eq.designer,user_roles.role.eq.designer')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching designers:', error);
        throw error;
      }
      
      // Deduplicate and transform
      const uniqueDesigners = data?.reduce((acc, user) => {
        if (!acc.find(existing => existing.id === user.id)) {
          acc.push({
            id: user.id,
            name: user.full_name || 'Unknown Designer',
            phone: user.phone
          });
        }
        return acc;
      }, [] as Designer[]) || [];
      
      console.log('Optimized designers list:', uniqueDesigners);
      return uniqueDesigners;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - user roles don't change often
    gcTime: 20 * 60 * 1000, // 20 minutes
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['users-salesmen'],
    queryFn: async () => {
      console.log('Fetching salesmen with optimized query...');
      
      // Single optimized query using LEFT JOIN
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          email,
          phone,
          role,
          user_roles!inner(role)
        `)
        .or('role.eq.salesman,user_roles.role.eq.salesman')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching salesmen:', error);
        throw error;
      }
      
      // Deduplicate and transform
      const uniqueSalesmen = data?.reduce((acc, user) => {
        if (!acc.find(existing => existing.id === user.id)) {
          acc.push({
            id: user.id,
            name: user.full_name || 'Unknown Salesman',
            email: user.email,
            phone: user.phone
          });
        }
        return acc;
      }, [] as Salesman[]) || [];
      
      console.log('Optimized salesmen list:', uniqueSalesmen);
      return uniqueSalesmen;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - user roles don't change often
    gcTime: 20 * 60 * 1000, // 20 minutes
  });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      console.log('Fetching job titles...');
      const { data, error } = await supabase
        .from('job_titles')
        .select('id, job_title_id')
        .order('job_title_id');
      
      if (error) {
        console.error('Error fetching job titles:', error);
        return [];
      }
      console.log('Job titles fetched:', data);
      return data as JobTitle[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - job titles rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
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

// Re-export types for backward compatibility
export type { Customer, Designer, Salesman, JobTitle };
