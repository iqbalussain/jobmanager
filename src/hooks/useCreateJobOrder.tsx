import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { cacheJobOrder } from '@/services/syncService';
import type { CreateJobOrderData, JobOrderRecord } from '@/types/jobOrder';

export function useCreateJobOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const generateJobOrderNumber = async (branch: string): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_next_job_order_number', {
      p_branch: branch
    });
    if (error) {
      console.error('Error generating job order number:', error);
      throw error;
    }
    return data;
  };

  const sendNotification = async (jobData: JobOrderRecord) => {
    try {
      // Get customer and job title details for notification
      const { data: customer } = await supabase
        .from('customers')
        .select('name')
        .eq('id', jobData.customer_id)
        .single();

      const { data: jobTitle } = jobData.job_title_id
        ? await supabase
            .from('job_titles')
            .select('job_title_id')
            .eq('id', jobData.job_title_id)
            .single()
        : { data: null };

      const { data: salesman } = jobData.salesman_id
        ? await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', jobData.salesman_id)
            .single()
        : { data: null };

      // Send notification via edge function
      await supabase.functions.invoke('send-notification', {
        body: {
          jobOrderNumber: jobData.job_order_number,
          customerName: customer?.name || 'Unknown',
          jobTitle: jobTitle?.job_title_id || 'Unknown',
          priority: jobData.priority,
          salesman: salesman?.full_name || 'Unknown',
          dueDate: jobData.due_date,
          notificationType: 'email', // You can make this configurable
          recipientEmail: 'manager@company.com' // Configure this in admin settings
        }
      });

    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const createJobOrderMutation = useMutation({
    mutationFn: async (data: CreateJobOrderData) => {
      
      if (!user) {
        const error = 'User must be authenticated to create job orders';
        console.error(error);
        throw new Error(error);
      }
      if (!navigator.onLine) {
        throw new Error('You are offline. Reconnect before creating a job order.');
      }

      // Validate required fields
      if (!data.customer_id || !data.job_title_id || !data.designer_id || !data.salesman_id) {
        const error = 'Missing required fields: customer, job title, designer, or salesman';
        console.error(error, { customer_id: data.customer_id, job_title_id: data.job_title_id, designer_id: data.designer_id, salesman_id: data.salesman_id });
        throw new Error(error);
      }

      let salesmanId = data.salesman_id;
      if (user.user_metadata?.role === 'salesman') {
        salesmanId = user.id;
      }

      let attempts = 0;
      let newJobOrder: JobOrderRecord | null = null;

      while (attempts < 5) {
        const jobOrderNumber = await generateJobOrderNumber(data.branch);

        const insertData = {
          job_order_number: jobOrderNumber,
          customer_id: data.customer_id,
          job_title_id: data.job_title_id,
          designer_id: data.designer_id,
          salesman_id: salesmanId,
          assignee: data.assignee || null,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date,
          estimated_hours: data.estimated_hours,
          branch: data.branch,
          job_order_details: data.job_order_details,
          delivered_at: data.delivered_at || null,
          client_name: data.client_name || null,
          created_by: user.id
        };
        

        const { data: inserted, error } = await supabase
          .from('job_orders')
          .insert(insertData)
          .select()
          .single();

        if (!error) {
          newJobOrder = inserted;
          // Send notification for approval if status is pending (non-blocking)
          if (inserted.status === 'pending') {
            sendNotification(inserted).catch(err => {
              console.warn('Failed to send notification, but job was created:', err);
            });
          }
          break;
        }

        console.error('Error inserting job order:', error);
        if (error.message.includes('duplicate key')) {
          console.warn(`Duplicate job order number: ${jobOrderNumber}. Retrying... (Attempt ${attempts + 1})`);
          attempts++;
          continue;
        }

        throw error;
      }

      if (!newJobOrder) {
        throw new Error('Failed to generate unique job order number after multiple attempts');
      }

      return newJobOrder;
    },

    onSuccess: (newJobOrder) => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      if (user) {
        void cacheJobOrder(newJobOrder, user.id).catch((error: unknown) => {
          console.error('Job was created, but the local cache could not be updated:', error);
          toast({
            title: 'Job created; local cache needs refresh',
            description: 'The job is saved in Supabase. Refresh after reconnecting to update this device.',
          });
        });
      }
      
      if (newJobOrder.priority === 'high') {
        addNotification({
          type: 'high_priority',
          message: `⚠ Job ${newJobOrder.job_order_number} has been marked as HIGH PRIORITY.`,
          jobOrderNumber: newJobOrder.job_order_number,
          read: false
        });
      }
      
      toast({
        title: 'Success',
        description: 'Job order created successfully.',
      });
    },

    onError: (error) => {
      console.error('Error creating job order:', error);
      toast({
        title: 'Error',
        description: `Failed to create job order: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    createJobOrder: createJobOrderMutation.mutateAsync,
    isCreating: createJobOrderMutation.isPending,
  };
}
