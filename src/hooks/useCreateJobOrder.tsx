
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface CreateJobOrderData {
  customer_id: string;
  job_title_id: string;
  designer_id: string;
  salesman_id: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'invoiced';
  due_date: string;
  estimated_hours: number;
  branch: string;
  job_order_details: string;
}

export function useCreateJobOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const generateJobOrderNumber = async (branch: string) => {
    const prefix = branch === 'Wadi Kabeer' ? 'WK' : 'HO';
    
    // Get the latest job order number for this branch
    const { data: latestOrder } = await supabase
      .from('job_orders')
      .select('job_order_number')
      .like('job_order_number', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNumber = 10001; // Starting number for both branches
    
    if (latestOrder && latestOrder.length > 0) {
      // Extract the numeric part and increment
      const lastNumber = parseInt(latestOrder[0].job_order_number.substring(2));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    return `${prefix}${nextNumber}`;
  };

  const createJobOrderMutation = useMutation({
    mutationFn: async (data: CreateJobOrderData) => {
      console.log('Creating job order with data:', data);
      
      if (!user) {
        throw new Error('User must be authenticated to create job orders');
      }
      
      // Generate job order number based on branch
      const jobOrderNumber = await generateJobOrderNumber(data.branch);
      
      const { data: newJobOrder, error } = await supabase
        .from('job_orders')
        .insert({
          job_order_number: jobOrderNumber,
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
          created_by: user.id // Use the authenticated user's ID
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
