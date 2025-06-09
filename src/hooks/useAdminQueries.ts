
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  department: string | null;
  branch: string | null;
  phone: string | null;
}

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
    enabled: !!user
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      checkAdminAccess();
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
    },
    enabled: !!user
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['salesmen'],
    queryFn: async () => {
      checkAdminAccess();
      console.log('Fetching salesmen from profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('role', 'salesman')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching salesmen:', error);
        throw error;
      }
      console.log('Salesmen fetched:', data);
      return data.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unknown Salesman',
        email: profile.email,
        phone: profile.phone
      })) as Salesman[];
    },
    enabled: !!user
  });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      checkAdminAccess();
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
    enabled: !!user
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      checkAdminAccess();
      console.log('Fetching profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, department, branch, phone')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      console.log('Profiles fetched:', data);
      return data as Profile[];
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
