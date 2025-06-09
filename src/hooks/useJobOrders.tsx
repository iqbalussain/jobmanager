
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
}

export interface Designer {
  id: string;
  name: string;
  phone: string | null;
}

export interface Salesman {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Assignee {
  id: string;
  full_name: string | null;
  email: string;
}

export interface JobTitle {
  id: string;
  job_title_id: string;
}

export interface JobOrder {
  id: string;
  job_order_number: string;
  customer_id: string;
  job_type_id: string | null;
  job_title_id: string | null;
  assignee_id: string | null;
  designer_id: string | null;
  salesman_id: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'invoiced';
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  branch: string | null;
  job_order_details: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  customer: Customer | null;
  designer: Designer | null;
  salesman: Salesman | null;
  assignee: Assignee | null;
  job_title: JobTitle | null;
  title?: string;
  description?: string;
}

export function useJobOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobOrders = [], isLoading, error } = useQuery({
    queryKey: ['job-orders'],
    queryFn: async () => {
      console.log('Fetching job orders...');
      const { data, error } = await supabase
        .from('job_orders')
        .select(`
          *,
          customer:customers(id, name),
          designer:designers(id, name, phone),
          salesman:salesmen(id, name, email, phone),
          assignee:profiles!job_orders_assignee_id_fkey(id, full_name, email),
          job_title:job_titles(id, job_title_id)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching job orders:', error);
        throw error;
      }
      
      console.log('Job orders fetched:', data);
      
      // Transform the data to ensure proper typing and handle potential null values
      const transformedData = data?.map(order => ({
        ...order,
        // Ensure customer is properly typed
        customer: order.customer && typeof order.customer === 'object' && 'id' in order.customer 
          ? order.customer as Customer 
          : null,
        // Ensure designer is properly typed  
        designer: order.designer && typeof order.designer === 'object' && 'id' in order.designer
          ? order.designer as Designer
          : null,
        // Ensure salesman is properly typed
        salesman: order.salesman && typeof order.salesman === 'object' && 'id' in order.salesman
          ? order.salesman as Salesman
          : null,
        // Ensure assignee is properly typed
        assignee: order.assignee && typeof order.assignee === 'object' && 'id' in order.assignee
          ? order.assignee as Assignee
          : null,
        // Ensure job_title is properly typed
        job_title: order.job_title && typeof order.job_title === 'object' && 'id' in order.job_title
          ? order.job_title as JobTitle
          : null,
        // Add title and description fallbacks if needed
        title: order.job_order_details || `Job Order ${order.job_order_number}`,
        description: order.job_order_details || ''
      })) || [];
      
      return transformedData;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log('Updating job order status:', id, status);
      const { data, error } = await supabase
        .from('job_orders')
        .update({ 
          status: status as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating job order status:', error);
        throw error;
      }
      
      console.log('Job order status updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      toast({
        title: "Status updated",
        description: "Job order status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update job order status. Please try again.",
        variant: "destructive",
      });
    }
  });

  console.log('Job orders hook state:', {
    count: jobOrders.length,
    isLoading,
    error: error?.message
  });

  return {
    jobOrders,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate
  };
}
