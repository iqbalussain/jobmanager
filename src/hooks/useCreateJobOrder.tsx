import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { cacheJobOrder } from '@/services/syncService';
import type { CreateJobOrderData, JobOrderRecord } from '@/types/jobOrder';
import { generateNextJobOrderNumber, insertJobOrder } from '@/data/jobs';
import { getCustomerName } from '@/data/customers';
import { getJobTitleName } from '@/data/jobTitles';
import { getProfileName } from '@/data/profiles';
import { invokeEdgeFunction } from '@/data/functions';

export function useCreateJobOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const generateJobOrderNumber = async (branch: string): Promise<string> => {
    return generateNextJobOrderNumber(branch);
  };

  const sendNotification = async (jobData: JobOrderRecord) => {
    try {
      // Get customer and job title details for notification
      const [customerName, jobTitleName, salesmanName] = await Promise.all([
        getCustomerName(jobData.customer_id),
        jobData.job_title_id ? getJobTitleName(jobData.job_title_id) : null,
        jobData.salesman_id ? getProfileName(jobData.salesman_id) : null,
      ]);

      // Send notification via edge function
      await invokeEdgeFunction('send-notification', {
        body: {
          jobOrderNumber: jobData.job_order_number,
          customerName: customerName || 'Unknown',
          jobTitle: jobTitleName || 'Unknown',
          priority: jobData.priority,
          salesman: salesmanName || 'Unknown',
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
        

        try {
          newJobOrder = await insertJobOrder(insertData);
        } catch (error) {
          if (error instanceof Error && error.message.includes('duplicate key')) {
            console.warn(`Duplicate job order number: ${jobOrderNumber}. Retrying... (Attempt ${attempts + 1})`);
            attempts++;
            continue;
          }
          throw error;
        }

        if (newJobOrder) {
          // Send notification for approval if status is pending (non-blocking)
          if (newJobOrder.status === 'pending') {
            sendNotification(newJobOrder).catch(err => {
              console.warn('Failed to send notification, but job was created:', err);
            });
          }
          break;
        }
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
