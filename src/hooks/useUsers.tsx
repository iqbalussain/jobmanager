
import { useQuery } from '@tanstack/react-query';
import { listProfilesForAdministration } from '@/data/profiles';

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  department: string | null;
  branch: string | null;
  phone: string | null;
}

export function useUsers() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      return listProfilesForAdministration();
    },
    staleTime: 10 * 60_000,
  });

  return {
    users,
    isLoading,
    error
  };
}
