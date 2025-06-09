
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Salesman {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export function useSalesmanManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [salesmanForm, setSalesmanForm] = useState({ name: '', email: '', phone: '' });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['salesmen'],
    queryFn: async () => {
      console.log('Fetching salesmen...');
      const { data, error } = await supabase
        .from('salesmen')
        .select('id, name, email, phone')
        .order('name');
      
      if (error) {
        console.error('Error fetching salesmen:', error);
        throw error;
      }
      console.log('Salesmen fetched:', data);
      return data as Salesman[];
    }
  });

  const addSalesmanMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string }) => {
      console.log('Adding salesman:', data.name, data.email, data.phone);
      const { data: result, error } = await supabase
        .from('salesmen')
        .insert({ 
          name: data.name, 
          email: data.email || null, 
          phone: data.phone || null 
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding salesman:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
      setSalesmanForm({ name: '', email: '', phone: '' });
      toast({
        title: "Success",
        description: "Salesman added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding salesman:', error);
      toast({
        title: "Error",
        description: "Failed to add salesman",
        variant: "destructive",
      });
    }
  });

  return {
    salesmen,
    salesmenLoading,
    salesmanForm,
    setSalesmanForm,
    addSalesmanMutation
  };
}
