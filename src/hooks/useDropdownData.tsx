
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Designer, Salesman, JobTitle } from '@/types/jobOrder';

export function useDropdownData() {
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      return data as Customer[];
    },
    staleTime: 10 * 60_000,
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['users-designers'],
    queryFn: async () => {
      // First get users with designer as primary role
      const { data: primaryDesigners, error: error1 } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('role', 'designer')
        .order('full_name');
      
      // Then get additional users from user_roles table using a separate query
      const { data: userRoleDesigners, error: error2 } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'designer');
      
      let additionalDesigners = [];
      if (userRoleDesigners && userRoleDesigners.length > 0) {
        const userIds = userRoleDesigners.map(ur => ur.user_id);
        const { data: additionalDesignersData, error: error3 } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', userIds)
          .neq('role', 'designer') // Exclude those already found in first query
          .order('full_name');
        
        additionalDesigners = additionalDesignersData || [];
      }
      
      if (error1 || error2) {
        console.error('Error fetching designers:', error1 || error2);
        throw error1 || error2;
      }
      
      // Combine and deduplicate results
      const allDesigners = [...(primaryDesigners || []), ...additionalDesigners];
      const uniqueDesigners = allDesigners.reduce((acc, user) => {
        if (!acc.find(existing => existing.id === user.id)) {
          acc.push(user);
        }
        return acc;
      }, [] as any[]);
      
      return uniqueDesigners.map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown Designer',
        phone: user.phone
      })) as Designer[];
    },
    staleTime: 10 * 60_000,
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['users-salesmen'],
    queryFn: async () => {
      // First get users with salesman as primary role
      const { data: primarySalesmen, error: error1 } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('role', 'salesman')
        .order('full_name');
      
      // Then get additional users from user_roles table using a separate query
      const { data: userRoleSalesmen, error: error2 } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'salesman');
      
      let additionalSalesmen = [];
      if (userRoleSalesmen && userRoleSalesmen.length > 0) {
        const userIds = userRoleSalesmen.map(ur => ur.user_id);
        const { data: additionalSalesmenData, error: error3 } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', userIds)
          .neq('role', 'salesman') // Exclude those already found in first query
          .order('full_name');
        
        additionalSalesmen = additionalSalesmenData || [];
      }
      
      if (error1 || error2) {
        console.error('Error fetching salesmen:', error1 || error2);
        throw error1 || error2;
      }
      
      // Combine and deduplicate results
      const allSalesmen = [...(primarySalesmen || []), ...additionalSalesmen];
      const uniqueSalesmen = allSalesmen.reduce((acc, user) => {
        if (!acc.find(existing => existing.id === user.id)) {
          acc.push(user);
        }
        return acc;
      }, [] as any[]);
      
      return uniqueSalesmen.map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown Salesman',
        email: user.email,
        phone: user.phone
      })) as Salesman[];
    },
    staleTime: 10 * 60_000,
  });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_titles')
        .select('id, job_title_id')
        .order('job_title_id');
      
      if (error) {
        console.error('Error fetching job titles:', error);
        return [];
      }
      return data as JobTitle[];
    },
    staleTime: 10 * 60_000,
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
