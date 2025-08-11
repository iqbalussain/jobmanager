import { supabase } from '@/integrations/supabase/client';

export interface JobOrdersQueryOptions {
  page?: number;
  pageSize?: number;
  status?: string;
  branch?: string;
  priority?: string;
  fields?: 'minimal' | 'full';
  search?: string;
}

export async function fetchJobOrders(options: JobOrdersQueryOptions = {}) {
  const { 
    page = 1, 
    pageSize = 50, 
    status, 
    branch, 
    priority, 
    fields = 'full',
    search 
  } = options;

  console.log('Fetching job orders with options:', options);

  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Build the select query based on requested fields
  let selectFields = '';
  if (fields === 'minimal') {
    selectFields = `
      id,
      job_order_number,
      status,
      priority,
      due_date,
      created_at,
      customer:customers(id, name),
      job_title:job_titles(id, job_title_id)
    `;
  } else {
    selectFields = `
      *,
      customer:customers(id, name),
      job_title:job_titles(id, job_title_id),
      designer:profiles!designer_id(id, full_name, phone),
      salesman:profiles!salesman_id(id, full_name, email, phone)
    `;
  }

  let query = supabase
    .from('job_orders')
    .select(selectFields, { count: 'exact' });

  // Apply filters
  if (status && status !== 'all') {
    query = query.eq('status', status as any);
  }
  
  if (branch) {
    query = query.eq('branch', branch);
  }
  
  if (priority) {
    query = query.eq('priority', priority as any);
  }

  // Apply search filter
  if (search && search.trim()) {
    query = query.or(`job_order_number.ilike.%${search}%,job_order_details.ilike.%${search}%,client_name.ilike.%${search}%`);
  }

  // Apply pagination and ordering
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);
  
  if (error) {
    console.error('Error fetching job orders:', error);
    throw error;
  }
  
  console.log(`Job orders fetched: ${data?.length || 0} of ${count || 0} total`);
  
  // Transform the data to maintain backward compatibility
  const transformedData = data?.map((jobOrder: any) => ({
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
  
  return {
    data: transformedData,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

// Legacy function for backward compatibility
export async function fetchAllJobOrders() {
  const result = await fetchJobOrders({ pageSize: 1000 });
  return result.data;
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
