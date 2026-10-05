
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';
import type { Customer, Designer, JobTitle, Salesman } from '@/types/jobOrder';
import { listCustomers } from '@/data/customers';
import { listJobTitles } from '@/data/jobTitles';
import {
  listDesigners,
  listProfilesForAdministration,
  listSalesmen,
} from '@/data/profiles';

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
      return listCustomers();
    },
    enabled: !!user
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      checkAdminAccess();
      const data = await listDesigners();
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
      const data = await listSalesmen();
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
      return listJobTitles();
    },
    enabled: !!user
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      checkAdminAccess();
      return listProfilesForAdministration();
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
