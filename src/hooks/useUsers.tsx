
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Fetching users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, department, branch, phone')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Users fetched:', data);
      return data;
    }
  });

  return {
    users,
    isLoading,
    error
  };
}
