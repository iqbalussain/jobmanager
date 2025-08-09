import { supabase } from '@/integrations/supabase/client';

interface FetchJobOrdersOptions {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Optimized function that eliminates N+1 queries
export async function fetchJobOrdersOptimized(options: FetchJobOrdersOptions = {}) {
  console.log('Fetching job orders optimized...', options);
  
  let query = supabase
    .from('job_orders')
    .select(`
      *,
      customer:customers!fk_job_orders_customer(id, name),
      job_title:job_titles(id, job_title_id),
      designer:profiles!designer_id(id, full_name, phone),
      salesman:profiles!salesman_id(id, full_name, email, phone)
    `);

  // Apply filters
  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status as any);
  }
  
  if (options.search) {
    query = query.or(`job_order_number.ilike.%${options.search}%,job_order_details.ilike.%${options.search}%`);
  }
  
  if (options.dateFrom) {
    query = query.gte('created_at', options.dateFrom);
  }
  
  if (options.dateTo) {
    query = query.lte('created_at', options.dateTo);
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching job orders optimized:', error);
    throw error;
  }
  
  console.log('Job orders fetched optimized:', data?.length);
  
  // Transform the data to match expected format
  const enrichedData = data?.map((jobOrder) => ({
    ...jobOrder,
    designer: jobOrder.designer ? {
      id: jobOrder.designer.id,
      name: jobOrder.designer.full_name || 'Unknown Designer',
      phone: jobOrder.designer.phone
    } : null,
    salesman: jobOrder.salesman ? {
      id: jobOrder.salesman.id,
      name: jobOrder.salesman.full_name || 'Unknown Salesman',
      email: jobOrder.salesman.email,
      phone: jobOrder.salesman.phone
    } : null
  })) || [];
  
  return enrichedData;
}

// Legacy function for backward compatibility (fallback)
export async function fetchJobOrders() {
  console.log('Fetching job orders (legacy fallback)...');
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
