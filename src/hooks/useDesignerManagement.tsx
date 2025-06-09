
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Designer {
  id: string;
  name: string;
  phone: string | null;
}

export function useDesignerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [designerForm, setDesignerForm] = useState({ name: '', phone: '' });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
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
    }
  });

  const addDesignerMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      console.log('Adding designer:', data.name, data.phone);
      const { data: result, error } = await supabase
        .from('designers')
        .insert({ name: data.name, phone: data.phone || null })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding designer:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designers'] });
      setDesignerForm({ name: '', phone: '' });
      toast({
        title: "Success",
        description: "Designer added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding designer:', error);
      toast({
        title: "Error",
        description: "Failed to add designer",
        variant: "destructive",
      });
    }
  });

  const handleAddDesigner = (e: React.FormEvent) => {
    e.preventDefault();
    if (designerForm.name.trim()) {
      addDesignerMutation.mutate({
        name: designerForm.name.trim(),
        phone: designerForm.phone.trim() || ""
      });
    }
  };

  return {
    designers,
    designersLoading,
    designerForm,
    setDesignerForm,
    addDesignerMutation,
    handleAddDesigner
  };
}
