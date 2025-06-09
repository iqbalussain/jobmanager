
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { sanitizeInput, validateJobOrderDetails, checkRateLimit } from '@/utils/inputValidation';

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

export function useSecureCreateJobOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const generateJobOrderNumber = async (branch: string) => {
    const sanitizedBranch = sanitizeInput(branch);
    const prefix = sanitizedBranch === 'Wadi Kabeer' ? 'WK' : 'HO';
    
    const { data: latestOrder } = await supabase
      .from('job_orders')
      .select('job_order_number')
      .like('job_order_number', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNumber = 10001;
    
    if (latestOrder && latestOrder.length > 0) {
      const lastNumber = parseInt(latestOrder[0].job_order_number.substring(2));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    return `${prefix}${nextNumber}`;
  };

  const createJobOrderMutation = useMutation({
    mutationFn: async (data: CreateJobOrderData) => {
      // Authentication check
      if (!user) {
        throw new Error('User must be authenticated to create job orders');
      }
      
      // Rate limiting check
      if (!checkRateLimit(`create_job_order_${user.id}`, 10, 60000)) {
        throw new Error('Too many job order creation attempts. Please wait a minute.');
      }
      
      // Input validation and sanitization
      const sanitizedData = {
        customer_id: sanitizeInput(data.customer_id),
        job_title_id: sanitizeInput(data.job_title_id),
        designer_id: sanitizeInput(data.designer_id),
        salesman_id: sanitizeInput(data.salesman_id),
        assignee: sanitizeInput(data.assignee),
        priority: data.priority,
        status: data.status,
        due_date: data.due_date,
        estimated_hours: Math.max(0, Math.min(1000, data.estimated_hours)), // Limit range
        branch: sanitizeInput(data.branch),
        job_order_details: sanitizeInput(data.job_order_details)
      };
      
      // Validate job order details
      if (!validateJobOrderDetails(sanitizedData.job_order_details)) {
        throw new Error('Job order details contain invalid characters or exceed maximum length');
      }
      
      // Validate priority and status
      const allowedPriorities = ['low', 'medium', 'high'];
      const allowedStatuses = ['pending', 'in-progress', 'designing', 'completed', 'finished', 'cancelled', 'invoiced'];
      
      if (!allowedPriorities.includes(sanitizedData.priority)) {
        throw new Error('Invalid priority value');
      }
      
      if (!allowedStatuses.includes(sanitizedData.status)) {
        throw new Error('Invalid status value');
      }
      
      console.log('Creating job order with validated data:', sanitizedData);
      
      // Generate job order number based on branch
      const jobOrderNumber = await generateJobOrderNumber(sanitizedData.branch);
      
      const { data: newJobOrder, error } = await supabase
        .from('job_orders')
        .insert({
          job_order_number: jobOrderNumber,
          customer_id: sanitizedData.customer_id,
          job_title_id: sanitizedData.job_title_id,
          designer_id: sanitizedData.designer_id,
          salesman_id: sanitizedData.salesman_id,
          assignee_id: sanitizedData.assignee || null,
          priority: sanitizedData.priority,
          status: sanitizedData.status,
          due_date: sanitizedData.due_date,
          estimated_hours: sanitizedData.estimated_hours,
          branch: sanitizedData.branch,
          job_order_details: sanitizedData.job_order_details,
          created_by: user.id
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
        description: error.message || "Failed to create job order",
        variant: "destructive",
      });
    }
  });

  return {
    createJobOrder: createJobOrderMutation.mutateAsync,
    isCreating: createJobOrderMutation.isPending
  };
}
