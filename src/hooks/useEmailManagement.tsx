import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailRecipient {
  id: string;
  email_address: string;
  name: string | null;
  category: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  content: string | null;
  email_type: string;
  job_order_id: string | null;
  sent_at: string;
  sent_by: string | null;
  status: string;
  error_message: string | null;
}

export function useEmailRecipients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recipients = [], isLoading, error } = useQuery({
    queryKey: ['email-recipients'],
    queryFn: async (): Promise<EmailRecipient[]> => {
      const { data, error } = await supabase
        .rpc('get_email_recipients');
      
      if (error) throw error;
      return data || [];
    },
  });

  const addRecipientMutation = useMutation({
    mutationFn: async (recipient: Omit<EmailRecipient, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { error } = await supabase
        .rpc('add_email_recipient', {
          email_address: recipient.email_address,
          name: recipient.name,
          category: recipient.category,
          is_active: recipient.is_active,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients'] });
      toast({
        title: "Recipient Added",
        description: "Email recipient has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add recipient: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateRecipientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailRecipient> }) => {
      const { error } = await supabase
        .rpc('update_email_recipient', {
          recipient_id: id,
          updates: updates,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients'] });
      toast({
        title: "Recipient Updated",
        description: "Email recipient has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update recipient: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRecipientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .rpc('delete_email_recipient', { recipient_id: id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients'] });
      toast({
        title: "Recipient Deleted",
        description: "Email recipient has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete recipient: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    recipients,
    isLoading,
    error,
    addRecipient: addRecipientMutation.mutate,
    updateRecipient: updateRecipientMutation.mutate,
    deleteRecipient: deleteRecipientMutation.mutate,
    isAddingRecipient: addRecipientMutation.isPending,
    isUpdatingRecipient: updateRecipientMutation.isPending,
    isDeletingRecipient: deleteRecipientMutation.isPending,
  };
}

export function useEmailLogs() {
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async (): Promise<EmailLog[]> => {
      const { data, error } = await supabase
        .rpc('get_email_logs');
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    logs,
    isLoading,
    error,
  };
}