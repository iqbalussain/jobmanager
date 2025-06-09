
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
    full_name: string;
  };
  salesman?: {
    full_name: string;
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
          customer:customers(name),
          assignee:profiles!job_orders_assignee_id_fkey(full_name),
          designer:profiles!job_orders_designer_id_fkey(full_name),
          salesman:profiles!job_orders_salesman_id_fkey(full_name)
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
        assignee_id: item.assignee_id,
        designer_id: item.designer_id,
        salesman_id: item.salesman_id,
        priority: item.priority,
        status: item.status,
        due_date: item.due_date,
        estimated_hours: item.estimated_hours,
        actual_hours: item.actual_hours,
        branch: item.branch,
        job_order_details: item.job_order_details,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
        customer: item.customer ? { name: item.customer.name } : undefined,
        assignee: item.assignee ? { full_name: item.assignee.full_name } : undefined,
        designer: item.designer ? { full_name: item.designer.full_name } : undefined,
        salesman: item.salesman ? { full_name: item.salesman.full_name } : undefined,
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
