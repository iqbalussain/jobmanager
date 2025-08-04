
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
    }
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['users-designers'],
    queryFn: async () => {
      console.log('Fetching designers from user profiles and user_roles...');
      
      // Get users who have designer role in either profiles table or user_roles table
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
      
      console.log('Designers fetched:', data);
      return data.map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown Designer',
        phone: user.phone
      })) as Designer[];
    }
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['users-salesmen'],
    queryFn: async () => {
      console.log('Fetching salesmen from user profiles and user_roles...');
      
      // Get users who have salesman role in either profiles table or user_roles table
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
      
      console.log('Salesmen fetched:', data);
      return data.map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown Salesman',
        email: user.email,
        phone: user.phone
      })) as Salesman[];
    }
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

// Re-export types for backward compatibility
export type { Customer, Designer, Salesman, JobTitle };
