
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
  delivered_at?: string;
  client_name?: string;
}

export function useCreateJobOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const branchPrefixes: Record<string, string> = {
    'Wadi Kabeer': 'WK',
    'Wajihat Ruwi': 'WR',
    'Head Office': 'HO',
    'Ruwi Branch': 'RB',
    'Ghubra Branch': 'GB',
  };
  const branchStartNumbers: Record<string, number> = {
  'WK': 20001,
  'WR': 30001,
  'HO': 10001,
  'RB': 40001,
  'GB': 50001,
  };

const generateJobOrderNumber = async (branch: string): Promise<string> => {
  const prefix = branchPrefixes[branch] || 'HO';
  const startNumber = branchStartNumbers[prefix] || 10001;

    const { data: latestOrder, error } = await supabase
      .from('job_orders')
      .select('job_order_number')
      .like('job_order_number', `${prefix}%`)
      .order('job_order_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest job order:', error);
      throw error;
    }

 let nextNumber = startNumber;

  if (latestOrder && latestOrder.length > 0) {
    const match = latestOrder[0].job_order_number.match(/\d+$/);
    const lastNumber = match ? parseInt(match[0], 10) : startNumber - 1;
    nextNumber = Math.max(lastNumber + 1, startNumber);
  }

  return `${prefix}${nextNumber}`;
};

  const sendNotification = async (jobData: any) => {
    try {
      // Get customer and job title details for notification
      const { data: customer } = await supabase
        .from('customers')
        .select('name')
        .eq('id', jobData.customer_id)
        .single();

      const { data: jobTitle } = await supabase
        .from('job_titles')
        .select('job_title_id')
        .eq('id', jobData.job_title_id)
        .single();

      const { data: salesman } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', jobData.salesman_id)
        .single();

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

      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const createJobOrderMutation = useMutation({
    mutationFn: async (data: CreateJobOrderData) => {
      console.log('Starting job order creation for user:', user?.id, 'role:', user?.role);
      console.log('Job order data:', data);
      
      if (!user) {
        const error = 'User must be authenticated to create job orders';
        console.error(error);
        throw new Error(error);
      }

      // Validate required fields
      if (!data.customer_id || !data.job_title_id || !data.designer_id || !data.salesman_id) {
        const error = 'Missing required fields: customer, job title, designer, or salesman';
        console.error(error, { customer_id: data.customer_id, job_title_id: data.job_title_id, designer_id: data.designer_id, salesman_id: data.salesman_id });
        throw new Error(error);
      }

      let salesmanId = data.salesman_id;
      if (user?.role === 'salesman') {
        salesmanId = user.id;
        console.log('Override salesman ID with current user ID:', salesmanId);
      }

      let attempts = 0;
      let newJobOrder = null;
      let insertError = null;

      while (attempts < 5) {
        const jobOrderNumber = await generateJobOrderNumber(data.branch);
        console.log('Generated job order number:', jobOrderNumber);

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
        
        console.log('Inserting job order with data:', insertData);

        const { data: inserted, error } = await supabase
          .from('job_orders')
          .insert(insertData)
          .select()
          .single();

        if (!error) {
          console.log('Job order created successfully:', inserted);
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

        insertError = error;
        break;
      }

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }

      if (!newJobOrder) {
        throw new Error('Failed to generate unique job order number after multiple attempts');
      }

      return newJobOrder;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      toast({
        title: 'Success',
        description: 'Job order created successfully. Notification sent for approval.',
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
