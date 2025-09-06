import { supabase } from '@/integrations/supabase/client';

export async function fetchJobOrders() {
  console.log('Fetching ALL job orders using batching strategy...');
  
  // First, get the total count
  const { count, error: countError } = await supabase
    .from('job_orders')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('Error getting job orders count:', countError);
    throw countError;
  }
  
  console.log(`Total job orders in database: ${count}`);
  
  // Fetch all job orders in batches of 1000
  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil((count || 0) / BATCH_SIZE);
  let allJobOrders: any[] = [];
  
  console.log(`Fetching ${totalBatches} batches of ${BATCH_SIZE} records each...`);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const from = batch * BATCH_SIZE;
    const to = from + BATCH_SIZE - 1;
    
    console.log(`Fetching batch ${batch + 1}/${totalBatches} (records ${from}-${to})...`);
    
    const { data, error } = await supabase
      .from('job_orders')
      .select(`
        *,
        customer:customers!fk_job_orders_customer(id, name),
        job_title:job_titles(id, job_title_id)
      `)
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching batch ${batch + 1}:`, error);
      throw error;
    }
    
    console.log(`Batch ${batch + 1} fetched: ${data?.length || 0} records`);
    allJobOrders = [...allJobOrders, ...(data || [])];
  }
  
  console.log(`Total job orders fetched: ${allJobOrders.length}`);
  
  // Collect unique designer and salesman IDs for bulk fetching
  const designerIds = [...new Set(allJobOrders.map(job => job.designer_id).filter(Boolean))];
  const salesmanIds = [...new Set(allJobOrders.map(job => job.salesman_id).filter(Boolean))];
  
  console.log(`Fetching ${designerIds.length} unique designers and ${salesmanIds.length} unique salesmen...`);
  
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
  
  console.log(`Successfully enriched ${enrichedData.length} job orders with profile data`);
  return enrichedData;
}

// New function for paginated admin queries with server-side filtering
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
  console.log('Fetching paginated job orders with filters:', filters);
  
  let query = supabase
    .from('job_orders')
    .select(`
      *,
      customer:customers!fk_job_orders_customer(id, name),
      job_title:job_titles(id, job_title_id)
    `, { count: 'exact' });

  // Apply server-side filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status as any);
  }
  
  if (filters.branch && filters.branch !== 'all') {
    query = query.ilike('branch', `%${filters.branch}%`);
  }
  
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Add search functionality for job details, job order number, and client name
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

  if (error) {
    console.error('Error fetching paginated job orders:', error);
    throw error;
  }

  console.log(`Paginated query - Total count: ${count}, Fetched: ${data?.length || 0}`);

  // Enrich with designer and salesman data
  const enrichedData = await Promise.all((data || []).map(async (jobOrder) => {
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

  // Apply remaining filters that need enriched data
  let filteredData = enrichedData;
  
  if (filters.salesman && filters.salesman !== 'all') {
    filteredData = filteredData.filter(job => 
      job.salesman?.name === filters.salesman
    );
  }
  
  if (filters.customer && filters.customer !== 'all') {
    filteredData = filteredData.filter(job => 
      job.customer?.name === filters.customer
    );
  }

  return {
    data: filteredData,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
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
