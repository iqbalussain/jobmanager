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
  job_title_id: string | null;
  assignee_id: string | null;
  designer_id: string | null;
  salesman_id: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'invoiced';
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
  job_title?: {
    title: string;
  };
}

export function useJobOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobOrders = [], isLoading, error } = useQuery({
    queryKey: ['job-orders'],
    queryFn: async () => {
      // Fetch job orders first
      const { data: orders, error: ordersError } = await supabase
        .from('job_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch related data separately
      const customerIds = [...new Set(orders?.map(o => o.customer_id).filter(Boolean))];
      const designerIds = [...new Set(orders?.map(o => o.designer_id).filter(Boolean))];
      const salesmanIds = [...new Set(orders?.map(o => o.salesman_id).filter(Boolean))];
      const jobTitleIds = [...new Set(orders?.map(o => o.job_title_id).filter(Boolean))];

      // Fetch customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name')
        .in('id', customerIds);

      // Fetch designers
      const { data: designers } = await supabase
        .from('designers')
        .select('id, name')
        .in('id', designerIds);

      // Fetch salesmen
      const { data: salesmen } = await supabase
        .from('salesmen')
        .select('id, name')
        .in('id', salesmanIds);

      // Fetch job titles
      const { data: jobTitles } = await supabase
        .from('job_titles')
        .select('id, title')
        .in('id', jobTitleIds);

      // Transform the data to match our interface
      return (orders || []).map(item => ({
        id: item.id,
        job_order_number: item.job_order_number,
        title: item.title,
        description: item.description,
        customer_id: item.customer_id,
        job_type_id: item.job_type_id,
        job_title_id: item.job_title_id,
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
        customer: customers?.find(c => c.id === item.customer_id),
        assignee: undefined, // We don't have profiles relationship anymore
        designer: designers?.find(d => d.id === item.designer_id),
        salesman: salesmen?.find(s => s.id === item.salesman_id),
        job_title: jobTitles?.find(jt => jt.id === item.job_title_id),
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
