import { supabase } from '@/integrations/supabase/client';
import { Quotation, QuotationItem } from '@/hooks/useQuotations';

export const convertQuotationToJobOrderWithItems = async (
  quotation: Quotation,
  items: QuotationItem[]
): Promise<string> => {
  try {
    // Call the existing conversion function
    const { data: jobOrderId, error: conversionError } = await supabase
      .rpc('convert_quotation_to_job_order', {
        quotation_id_param: quotation.id
      });

    if (conversionError) throw conversionError;

    // Create job order items from quotation items
    const jobOrderItems = items.map((item, index) => ({
      job_order_id: jobOrderId,
      job_title_id: item.job_title_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      order_sequence: index
    }));

    // Insert job order items
    const { error: itemsError } = await supabase
      .from('job_order_items')
      .insert(jobOrderItems);

    if (itemsError) throw itemsError;

    return jobOrderId;
  } catch (error) {
    console.error('Error converting quotation to job order:', error);
    throw new Error('Failed to convert quotation to job order with items');
  }
};