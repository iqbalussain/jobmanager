
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobOrder {
  id: string;
  job_order_number: string;
  title: string;
  description: string | null;
  customer_id: string;
  job_type_id: string | null;
  item_id: string | null;
  assignee_id: string | null;
  designer_id: string | null;
  salesman_id: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'overdue';
  due_date: string | null;
  estimated_hours: number;
  actual_hours: number;
  branch: string | null;
  job_order_details: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
  };
  assignee?: {
    full_name: string;
  };
  designer?: {
    name: string;
  };
  salesman?: {
    name: string;
  };
  item?: {
    name: string;
  };
}

export function useJobOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobOrders = [], isLoading, error } = useQuery({
    queryKey: ['job-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(`
          *,
          customers!customer_id(name),
          profiles!assignee_id(full_name),
          designers!designer_id(name),
          salesmen!salesman_id(name),
          items!item_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        id: item.id,
        job_order_number: item.job_order_number,
        title: item.title,
        description: item.description,
        customer_id: item.customer_id,
        job_type_id: item.job_type_id,
        item_id: item.item_id,
        assignee_id: item.assignee_id,
        designer_id: item.designer_id,
        salesman_id: item.salesman_id,
        priority: item.priority,
        status: item.status,
        due_date: item.due_date,
        estimated_hours: item.estimated_hours || 0,
        actual_hours: item.actual_hours || 0,
        branch: item.branch,
        job_order_details: item.job_order_details,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
        customer: item.customers ? { name: item.customers.name } : undefined,
        assignee: item.profiles ? { full_name: item.profiles.full_name } : undefined,
        designer: item.designers ? { name: item.designers.name } : undefined,
        salesman: item.salesmen ? { name: item.salesmen.name } : undefined,
        item: item.items ? { name: item.items.name } : undefined,
      })) as JobOrder[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobOrder['status'] }) => {
      const { data, error } = await supabase
        .from('job_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      toast({
        title: "Success",
        description: "Job order status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update job order: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    jobOrders,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
}
