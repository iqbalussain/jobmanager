import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobOrderItem {
  id: string;
  job_order_id: string;
  job_title_id: string;
  description: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  order_sequence: number;
  job_titles?: {
    job_title_id: string;
  };
}

export interface CreateJobOrderItemData {
  job_order_id: string;
  job_title_id: string;
  description: string;
  quantity: number;
  unit_price?: number;
  order_sequence: number;
}

export function useJobOrderItems(jobOrderId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['job-order-items', jobOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_order_items')
        .select(`
          *,
          job_titles!inner(job_title_id)
        `)
        .eq('job_order_id', jobOrderId)
        .order('order_sequence');

      if (error) throw error;
      return data as any;
    },
    enabled: !!jobOrderId
  });

  const addItemMutation = useMutation({
    mutationFn: async (itemData: CreateJobOrderItemData) => {
      const totalPrice = itemData.unit_price ? itemData.quantity * itemData.unit_price : null;
      
      const { data, error } = await supabase
        .from('job_order_items')
        .insert({
          ...itemData,
          total_price: totalPrice
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-order-items', jobOrderId] });
      toast({
        title: "Item added",
        description: "Job order item has been added successfully"
      });
    },
    onError: (error) => {
      console.error('Error adding job order item:', error);
      toast({
        title: "Error",
        description: "Failed to add job order item",
        variant: "destructive"
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<JobOrderItem> & { id: string }) => {
      // Recalculate total if quantity or unit_price changed
      const totalPrice = updateData.unit_price && updateData.quantity 
        ? updateData.quantity * updateData.unit_price 
        : undefined;

      const { data, error } = await supabase
        .from('job_order_items')
        .update({
          ...updateData,
          ...(totalPrice !== undefined && { total_price: totalPrice })
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-order-items', jobOrderId] });
      toast({
        title: "Item updated",
        description: "Job order item has been updated successfully"
      });
    },
    onError: (error) => {
      console.error('Error updating job order item:', error);
      toast({
        title: "Error",
        description: "Failed to update job order item",
        variant: "destructive"
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('job_order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-order-items', jobOrderId] });
      toast({
        title: "Item deleted",
        description: "Job order item has been deleted successfully"
      });
    },
    onError: (error) => {
      console.error('Error deleting job order item:', error);
      toast({
        title: "Error",
        description: "Failed to delete job order item",
        variant: "destructive"
      });
    }
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addItemMutation,
    updateItemMutation,
    deleteItemMutation
  };
}