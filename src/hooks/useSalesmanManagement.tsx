
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
    }
  });

  const addSalesmanMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string }) => {
      console.log('Adding salesman to profiles:', data.name, data.email, data.phone);
      // Note: In a real implementation, you would create a new user account first
      // and then update their profile. For now, this is just a placeholder.
      throw new Error('Adding salesmen requires proper user account creation flow');
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
        description: "Failed to add salesman. Please contact an administrator.",
        variant: "destructive",
      });
    }
  });

  const handleAddSalesman = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesmanForm.name.trim()) {
      addSalesmanMutation.mutate({
        name: salesmanForm.name.trim(),
        email: salesmanForm.email.trim() || "",
        phone: salesmanForm.phone.trim() || ""
      });
    }
  };

  return {
    salesmen,
    salesmenLoading,
    salesmanForm,
    setSalesmanForm,
    addSalesmanMutation,
    handleAddSalesman
  };
}
