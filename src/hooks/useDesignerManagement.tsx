
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDesignerProfiles } from '@/data/profiles';
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
      const data = await listDesignerProfiles();
      return data.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Unknown Designer',
        phone: profile.phone
      })) as Designer[];
    }
  });

  const addDesignerMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      throw new Error('Adding designers requires creating user accounts first');
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
        description: "Failed to add designer. Designers must be added through the user management interface.",
        variant: "destructive",
      });
    }
  });

  const handleAddDesigner = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Information",
      description: "Designers must be added through the user management interface as they are now users with designer role.",
    });
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
