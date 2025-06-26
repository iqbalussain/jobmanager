
import { supabase } from '@/integrations/supabase/client';

export async function fetchJobOrders() {
  console.log('Fetching job orders...');
  const { data, error } = await supabase
    .from('job_orders')
    .select(`
      *,
      customer:customers!fk_job_orders_customer(id, name),
      job_title:job_titles(id, job_title_id)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching job orders:', error);
    throw error;
  }
  
  console.log('Job orders fetched:', data);
  
  // Manually fetch designer and salesman data from profiles
  const enrichedData = await Promise.all(data.map(async (jobOrder) => {
    let designer = null;
    let salesman = null;
    
    if (jobOrder.designer_id) {
      const { data: designerData } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('id', jobOrder.designer_id)
        .single();
      
      if (designerData) {
        designer = {
          id: designerData.id,
          name: designerData.full_name || 'Unknown Designer',
          phone: designerData.phone
        };
      }
    }
    
    if (jobOrder.salesman_id) {
      const { data: salesmanData } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('id', jobOrder.salesman_id)
        .single();
      
      if (salesmanData) {
        salesman = {
          id: salesmanData.id,
          name: salesmanData.full_name || 'Unknown Salesman',
          email: salesmanData.email,
          phone: salesmanData.phone
        };
      }
    }
    
    return {
      ...jobOrder,
      designer,
      salesman
    };
  }));
  
  return enrichedData;
}

export async function updateJobOrderStatus(id: string, status: string) {
  console.log('Updating job order status:', id, status);
  
  // Calculate actual hours if status is being changed to completed
  let updateData: any = { 
    status: status as any,
    updated_at: new Date().toISOString()
  };
  
  if (status === 'completed') {
    // Fetch the job order to get creation time
    const { data: jobOrder } = await supabase
      .from('job_orders')
      .select('created_at')
      .eq('id', id)
      .single();
    
    if (jobOrder) {
      const createdAt = new Date(jobOrder.created_at);
      const completedAt = new Date();
      const timeDiffMs = completedAt.getTime() - createdAt.getTime();
      const timeDiffHours = Math.round(timeDiffMs / (1000 * 60 * 60));
      updateData.actual_hours = timeDiffHours > 0 ? timeDiffHours : 0;
      
      console.log('Calculated actual hours:', updateData.actual_hours);
    }
  }
  
  const { data, error } = await supabase
    .from('job_orders')
    .update(updateData)
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
