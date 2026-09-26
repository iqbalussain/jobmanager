
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';
import type { Customer, Designer, JobTitle, Salesman } from '@/types/jobOrder';

export type { Customer, Designer, JobTitle, Salesman };
export type Profile = Pick<
  Tables<'profiles'>,
  'id' | 'full_name' | 'email' | 'role' | 'department' | 'branch' | 'phone'
>;

export function useAdminQueries() {
  const { user } = useAuth();

  // Authorization check hook
  const checkAdminAccess = () => {
    if (!user) {
      throw new Error('Authentication required');
    }
    return true;
  };

  // Data queries with proper error handling
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      checkAdminAccess();
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      checkAdminAccess();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('role', 'designer')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching designers:', error);
        throw error;
      }
      return data.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unknown Designer',
        phone: profile.phone
      }));
    },
    enabled: !!user
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['salesmen'],
    queryFn: async () => {
      checkAdminAccess();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('role', 'salesman')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching salesmen:', error);
        throw error;
      }
      return data.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unknown Salesman',
        email: profile.email,
        phone: profile.phone
      }));
    },
    enabled: !!user
  });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      checkAdminAccess();
      const { data, error } = await supabase
        .from('job_titles')
        .select('id, job_title_id')
        .order('job_title_id');
      
      if (error) {
        console.error('Error fetching job titles:', error);
        return [];
      }
      return data;
    },
    enabled: !!user
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      checkAdminAccess();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, department, branch, phone')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user
  });

  return {
    customers,
    designers,
    salesmen,
    jobTitles,
    profiles,
    customersLoading,
    designersLoading,
    salesmenLoading,
    jobTitlesLoading,
    profilesLoading,
    checkAdminAccess
  };
}
