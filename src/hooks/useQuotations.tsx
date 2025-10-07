import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  salesman_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
  total_amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  converted_to_job_order_id?: string;
  notes?: string;
  // Joined data
  customer_name?: string;
  salesman_name?: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  job_title_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  order_sequence: number;
  job_title?: string;
}

export function useQuotations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotationsError) {
        console.error('Error fetching quotations:', quotationsError);
        throw quotationsError;
      }

      // Fetch customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name');

      // Fetch salesmen profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name');

      // Map the data together
      const enrichedQuotations = quotationsData?.map(quotation => ({
        ...quotation,
        customer_name: customers?.find(c => c.id === quotation.customer_id)?.name,
        salesman_name: profiles?.find(p => p.id === quotation.salesman_id)?.full_name
      })) || [];

      return enrichedQuotations as Quotation[];
    }
  });

  const createQuotationMutation = useMutation({
    mutationFn: async (quotationData: {
      customer_id: string;
      salesman_id: string;
      notes?: string;
    }) => {
      // Generate quotation number
      const { data: numberData, error: numberError } = await supabase
        .rpc('generate_quotation_number');

      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('quotations')
        .insert({
          ...quotationData,
          quotation_number: numberData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Success",
        description: "Quotation created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to create quotation",
        variant: "destructive",
      });
    }
  });

  const updateQuotationMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Quotation> & { id: string }) => {
      const { data, error } = await supabase
        .from('quotations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Success",
        description: "Quotation updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating quotation:', error);
      toast({
        title: "Error",
        description: "Failed to update quotation",
        variant: "destructive",
      });
    }
  });

  const convertToJobOrderMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      // Call the database function which now handles everything
      const { data: jobOrderId, error } = await supabase
        .rpc('convert_quotation_to_job_order', {
          quotation_id_param: quotationId
        });

      if (error) throw error;
      return jobOrderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      queryClient.invalidateQueries({ queryKey: ['job_order_items'] });
      toast({
        title: "Success",
        description: "Quotation converted to job order with all items",
      });
    },
    onError: (error: any) => {
      console.error('Error converting quotation:', error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert quotation to job order",
        variant: "destructive",
      });
    }
  });

  return {
    quotations,
    isLoading,
    createQuotationMutation,
    updateQuotationMutation,
    convertToJobOrderMutation
  };
}

export function useQuotationItems(quotationId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['quotation-items', quotationId],
    queryFn: async () => {
      const { data: itemsData, error } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotationId)
        .order('order_sequence');

      if (error) {
        console.error('Error fetching quotation items:', error);
        throw error;
      }

      // Fetch job titles
      const { data: jobTitles } = await supabase
        .from('job_titles')
        .select('id, job_title_id');

      // Map the data together
      const enrichedItems = itemsData?.map(item => ({
        ...item,
        job_title: jobTitles?.find(jt => jt.id === item.job_title_id)?.job_title_id
      })) || [];

      return enrichedItems as QuotationItem[];
    },
    enabled: !!quotationId
  });

  const addItemMutation = useMutation({
    mutationFn: async (itemData: Omit<QuotationItem, 'id' | 'total_price'>) => {
      const total_price = itemData.quantity * itemData.unit_price;
      
      const { data, error } = await supabase
        .from('quotation_items')
        .insert({
          ...itemData,
          total_price
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-items', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QuotationItem> & { id: string }) => {
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        const currentItem = items.find(item => item.id === id);
        if (currentItem) {
          const quantity = updates.quantity ?? currentItem.quantity;
          const unit_price = updates.unit_price ?? currentItem.unit_price;
          updates.total_price = quantity * unit_price;
        }
      }

      const { data, error } = await supabase
        .from('quotation_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-items', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('quotation_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-items', quotationId] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    }
  });

  return {
    items,
    isLoading,
    addItemMutation,
    updateItemMutation,
    deleteItemMutation
  };
}