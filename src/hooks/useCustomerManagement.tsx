
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer, listCustomers } from '@/data/customers';
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
      return listCustomers();
    }
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return createCustomer(data.name);
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
