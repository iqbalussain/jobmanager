
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  name: string;
}

export interface Designer {
  id: string;
  name: string;
}

export interface Salesman {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
}

export function useDropdownData() {
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as Customer[];
    }
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as Designer[];
    }
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['salesmen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salesmen')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as Salesman[];
    }
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, description')
        .order('name');
      
      if (error) throw error;
      return data as Item[];
    }
  });

  return {
    customers,
    designers,
    salesmen,
    items,
    isLoading: customersLoading || designersLoading || salesmenLoading || itemsLoading
  };
}
