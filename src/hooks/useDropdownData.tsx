
import { useQuery } from '@tanstack/react-query';
import { Customer, Designer, Salesman, JobTitle } from '@/types/jobOrder';
import { listCustomers } from '@/data/customers';
import { listJobTitles } from '@/data/jobTitles';
import { listProfilesByIds, listUserRoleIds, listDesigners, listSalesmen } from '@/data/profiles';

export function useDropdownData() {
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      return listCustomers() as Promise<Customer[]>;
    },
    staleTime: 10 * 60_000,
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['users-designers'],
    queryFn: async () => {
      // First get users with designer as primary role
      const primaryDesigners = await listDesigners();
      
      // Then get additional users from user_roles table using a separate query
      const userRoleDesigners = await listUserRoleIds('designer');
      
      let additionalDesigners: typeof primaryDesigners = [];
      if (userRoleDesigners && userRoleDesigners.length > 0) {
        const userIds = userRoleDesigners.map(ur => ur.user_id);
        const extraProfiles = await listProfilesByIds(userIds, 'designer');
        additionalDesigners = extraProfiles.map(({ id, full_name, phone }) => ({
          id,
          full_name,
          phone,
        }));
      }
      
      // Combine and deduplicate results
      const allDesigners = [...(primaryDesigners || []), ...additionalDesigners];
      const uniqueDesigners = Array.from(new Map(allDesigners.map((profile) => [profile.id, profile])).values());
      
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
      const primarySalesmen = await listSalesmen();
      
      // Then get additional users from user_roles table using a separate query
      const userRoleSalesmen = await listUserRoleIds('salesman');
      
      let additionalSalesmen: typeof primarySalesmen = [];
      if (userRoleSalesmen && userRoleSalesmen.length > 0) {
        const userIds = userRoleSalesmen.map(ur => ur.user_id);
        const extraProfiles = await listProfilesByIds(userIds, 'salesman');
        additionalSalesmen = extraProfiles.map(({ id, full_name, email, phone }) => ({
          id,
          full_name,
          email,
          phone,
        }));
      }
      
      // Combine and deduplicate results
      const allSalesmen = [...(primarySalesmen || []), ...additionalSalesmen];
      const uniqueSalesmen = Array.from(new Map(allSalesmen.map((profile) => [profile.id, profile])).values());
      
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
      return listJobTitles() as Promise<JobTitle[]>;
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
