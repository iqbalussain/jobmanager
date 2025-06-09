
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
}

export function useCustomerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customerForm, setCustomerForm] = useState({ name: '' });

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

  const addCustomerMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      console.log('Adding customer:', data.name);
      const { data: result, error } = await supabase
        .from('customers')
        .insert({ name: data.name })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding customer:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCustomerForm({ name: '' });
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerForm.name.trim()) {
      addCustomerMutation.mutate({ name: customerForm.name.trim() });
    }
  };

  return {
    customers,
    customersLoading,
    customerForm,
    setCustomerForm,
    addCustomerMutation,
    handleAddCustomer
  };
}
