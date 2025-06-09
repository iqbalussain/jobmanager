
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreateJobOrderData {
  title: string;
  description: string;
  customer_id: string;
  job_title_id: string;
  designer_id: string;
  salesman_id: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'overdue';
  due_date: string;
  estimated_hours: number;
  branch: string;
  job_order_details: string;
}

export function useCreateJobOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createJobOrderMutation = useMutation({
    mutationFn: async (data: CreateJobOrderData) => {
      console.log('Creating job order with data:', data);
      
      // Generate job order number
      const jobOrderNumber = `JO-${Date.now()}`;
      
      const { data: newJobOrder, error } = await supabase
        .from('job_orders')
        .insert({
          job_order_number: jobOrderNumber,
          title: data.title,
          description: data.description,
          customer_id: data.customer_id,
          job_title_id: data.job_title_id,
          designer_id: data.designer_id,
          salesman_id: data.salesman_id,
          assignee_id: null, // We'll store assignee name in a separate field if needed
          priority: data.priority,
          status: data.status,
          due_date: data.due_date,
          estimated_hours: data.estimated_hours,
          branch: data.branch,
          job_order_details: data.job_order_details,
          created_by: '00000000-0000-0000-0000-000000000000' // Placeholder user ID
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Job order created successfully:', newJobOrder);
      return newJobOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      toast({
        title: "Success",
        description: "Job order created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating job order:', error);
      toast({
        title: "Error",
        description: `Failed to create job order: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    createJobOrder: createJobOrderMutation.mutateAsync,
    isCreating: createJobOrderMutation.isPending
  };
}
