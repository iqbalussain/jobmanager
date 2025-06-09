
import { supabase } from '@/integrations/supabase/client';

export async function fetchJobOrders() {
  console.log('Fetching job orders...');
  const { data, error } = await supabase
    .from('job_orders')
    .select(`
      *,
      customer:customers(id, name),
      designer:profiles!job_orders_designer_id_fkey(id, full_name, phone),
      salesman:profiles!job_orders_salesman_id_fkey(id, full_name, email, phone),
      job_title:job_titles(id, job_title_id)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching job orders:', error);
    throw error;
  }
  
  console.log('Job orders fetched:', data);
  return data;
}

export async function updateJobOrderStatus(id: string, status: string) {
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
}
