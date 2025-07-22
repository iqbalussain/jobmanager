
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

  const createJobOrderMutation = useMutation({
    mutationFn: async (data: CreateJobOrderData) => {
      if (!user) throw new Error('User must be authenticated to create job orders');

      let salesmanId = data.salesman_id;
      if (user?.role === 'salesman') {
        salesmanId = user.id;
      }

      let attempts = 0;
      let newJobOrder = null;
      let insertError = null;

      while (attempts < 5) {
        const jobOrderNumber = await generateJobOrderNumber(data.branch);

        const { data: inserted, error } = await supabase
          .from('job_orders')
          .insert({
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
            created_by: user.id
          })
          .select()
          .single();

        if (!error) {
          newJobOrder = inserted;
          break;
        }

        if (error.message.includes('duplicate key')) {
          console.warn(`Duplicate job order number: ${jobOrderNumber}. Retrying...`);
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
        description: 'Job order created successfully',
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
