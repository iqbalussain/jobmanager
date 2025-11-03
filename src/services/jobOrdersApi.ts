import { supabase } from '@/integrations/supabase/client';

export async function fetchJobOrders() {
  // First, get the total count
  const { count, error: countError } = await supabase
    .from('job_orders')
    .select('*', { count: 'exact', head: true });
  
  if (countError) throw countError;
  
  // Fetch all job orders in batches of 1000
  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil((count || 0) / BATCH_SIZE);
  let allJobOrders: any[] = [];
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const from = batch * BATCH_SIZE;
    const to = from + BATCH_SIZE - 1;
    
    const { data, error } = await supabase
      .from('job_orders')
      .select(`
        *,
        customer:customers!fk_job_orders_customer(id, name),
        job_title:job_titles(id, job_title_id)
      `)
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    allJobOrders = [...allJobOrders, ...(data || [])];
  }
  
  // Collect unique designer and salesman IDs for bulk fetching
  const designerIds = [...new Set(allJobOrders.map(job => job.designer_id).filter(Boolean))];
  const salesmanIds = [...new Set(allJobOrders.map(job => job.salesman_id).filter(Boolean))];
  
  // Bulk fetch designers and salesmen
  const [designersData, salesmenData] = await Promise.all([
    designerIds.length > 0 
      ? supabase.from('profiles').select('id, full_name, phone').in('id', designerIds)
      : Promise.resolve({ data: [] }),
    salesmanIds.length > 0
      ? supabase.from('profiles').select('id, full_name, email, phone').in('id', salesmanIds)
      : Promise.resolve({ data: [] })
  ]);
  
  // Create maps for quick lookup
  const designersMap = new Map();
  const salesmenMap = new Map();
  
  (designersData.data || []).forEach(designer => {
    designersMap.set(designer.id, {
      id: designer.id,
      name: designer.full_name || 'Unknown Designer',
      phone: designer.phone
    });
  });
  
  (salesmenData.data || []).forEach(salesman => {
    salesmenMap.set(salesman.id, {
      id: salesman.id,
      name: salesman.full_name || 'Unknown Salesman',
      email: salesman.email,
      phone: salesman.phone
    });
  });
  
  // Enrich job orders with designer and salesman data
  const enrichedData = allJobOrders.map(jobOrder => ({
    ...jobOrder,
    designer: jobOrder.designer_id ? designersMap.get(jobOrder.designer_id) || null : null,
    salesman: jobOrder.salesman_id ? salesmenMap.get(jobOrder.salesman_id) || null : null
  }));
  
  return enrichedData;
}

// Optimized function for paginated admin queries with proper server-side filtering
export async function fetchJobOrdersPaginated(
  page: number = 1,
  pageSize: number = 50,
  filters: {
    status?: string;
    branch?: string;
    salesman?: string;
    customer?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  } = {}
) {
  // First, get IDs for salesman and customer filters if provided
  let salesmanId: string | null = null;
  let customerId: string | null = null;

  if (filters.salesman && filters.salesman !== 'all') {
    const { data: salesmanData } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', filters.salesman)
      .single();
    salesmanId = salesmanData?.id || null;
  }

  if (filters.customer && filters.customer !== 'all') {
    const { data: customerData } = await supabase
      .from('customers')
      .select('id')
      .eq('name', filters.customer)
      .single();
    customerId = customerData?.id || null;
  }

  let query = supabase
    .from('job_orders')
    .select(`
      *,
      customer:customers!fk_job_orders_customer(id, name),
      job_title:job_titles(id, job_title_id)
    `, { count: 'exact' });

  // Apply all server-side filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status as any);
  }
  
  if (filters.branch && filters.branch !== 'all') {
    query = query.eq('branch', filters.branch);
  }

  if (salesmanId) {
    query = query.eq('salesman_id', salesmanId);
  }

  if (customerId) {
    query = query.eq('customer_id', customerId);
  }
  
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Add search functionality
  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.trim();
    query = query.or(`job_order_number.ilike.%${searchTerm}%,job_order_details.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,assignee.ilike.%${searchTerm}%`);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, count, error } = await query
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Batch enrich with designer and salesman data
  const designerIds = [...new Set((data || []).map(job => job.designer_id).filter(Boolean))];
  const salesmanIds = [...new Set((data || []).map(job => job.salesman_id).filter(Boolean))];

  const [designersData, salesmenData] = await Promise.all([
    designerIds.length > 0 
      ? supabase.from('profiles').select('id, full_name, phone').in('id', designerIds)
      : Promise.resolve({ data: [] }),
    salesmanIds.length > 0
      ? supabase.from('profiles').select('id, full_name, email, phone').in('id', salesmanIds)
      : Promise.resolve({ data: [] })
  ]);

  // Create maps for quick lookup
  const designersMap = new Map();
  const salesmenMap = new Map();
  
  (designersData.data || []).forEach(designer => {
    designersMap.set(designer.id, {
      id: designer.id,
      name: designer.full_name || 'Unknown Designer',
      phone: designer.phone
    });
  });
  
  (salesmenData.data || []).forEach(salesman => {
    salesmenMap.set(salesman.id, {
      id: salesman.id,
      name: salesman.full_name || 'Unknown Salesman',
      email: salesman.email,
      phone: salesman.phone
    });
  });

  // Enrich data with maps
  const enrichedData = (data || []).map(jobOrder => ({
    ...jobOrder,
    designer: jobOrder.designer_id ? designersMap.get(jobOrder.designer_id) || null : null,
    salesman: jobOrder.salesman_id ? salesmenMap.get(jobOrder.salesman_id) || null : null
  }));

  return {
    data: enrichedData,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function updateJobOrderStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('job_orders')
    .update({ 
      status: status as any,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
