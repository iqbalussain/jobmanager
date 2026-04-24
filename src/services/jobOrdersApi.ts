import { supabase } from '@/integrations/supabase/client';

// Egress-optimized column list (excludes large `description` HTML)
const JOB_LIST_COLUMNS =
  'id,job_order_number,customer_id,job_title_id,designer_id,salesman_id,status,priority,branch,assignee,due_date,estimated_hours,actual_hours,total_value,invoice_number,job_order_details,client_name,delivered_at,approval_status,approval_notes,approved_by,approved_at,created_by,created_at,updated_at,description_plain';

export async function fetchJobOrders() {
  // First, get the total count
  const { count, error: countError } = await supabase
    .from('job_orders')
    .select('id', { count: 'exact', head: true });
  
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
      .select(`${JOB_LIST_COLUMNS},customer:customers!fk_job_orders_customer(id,name),job_title:job_titles(id,job_title_id)`)
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

// New function for paginated admin queries with server-side filtering
export async function fetchJobOrdersPaginated(
  page: number = 1,
  pageSize: number = 50,
  filters: {
    status?: string;
    branch?: string;
    salesman?: string;
    salesmanId?: string;
    customer?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  } = {}
) {
  let query = supabase
    .from('job_orders')
    .select(
      `${JOB_LIST_COLUMNS},customer:customers!fk_job_orders_customer(id,name),job_title:job_titles(id,job_title_id)`,
      { count: 'exact' }
    );

  // Apply server-side filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status as any);
  }
  
  if (filters.branch && filters.branch !== 'all') {
    query = query.ilike('branch', `%${filters.branch}%`);
  }
  
  // Server-side filtering by ID when available (avoids over-fetching)
  if (filters.salesmanId && filters.salesmanId !== 'all') {
    query = query.eq('salesman_id', filters.salesmanId);
  }
  if (filters.customerId && filters.customerId !== 'all') {
    query = query.eq('customer_id', filters.customerId);
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

  if (error) throw error;

  // Batch-fetch designer + salesman profiles in a single query (was N+1)
  const rows = data || [];
  const profileIds = Array.from(
    new Set(
      rows.flatMap((r: any) => [r.designer_id, r.salesman_id]).filter(Boolean)
    )
  );

  const profileMap = new Map<string, any>();
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', profileIds);
    (profiles || []).forEach((p) => profileMap.set(p.id, p));
  }

  const enrichedData = rows.map((jobOrder: any) => {
    const d = jobOrder.designer_id ? profileMap.get(jobOrder.designer_id) : null;
    const s = jobOrder.salesman_id ? profileMap.get(jobOrder.salesman_id) : null;
    return {
      ...jobOrder,
      designer: d
        ? { id: d.id, name: d.full_name || 'Unknown Designer', phone: d.phone }
        : null,
      salesman: s
        ? {
            id: s.id,
            name: s.full_name || 'Unknown Salesman',
            email: s.email,
            phone: s.phone,
          }
        : null,
    };
  });

  // Fallback name-based filters (only used when ID isn't passed)
  let filteredData = enrichedData;
  
  if (!filters.salesmanId && filters.salesman && filters.salesman !== 'all') {
    filteredData = filteredData.filter(job => 
      job.salesman?.name === filters.salesman
    );
  }
  
  if (!filters.customerId && filters.customer && filters.customer !== 'all') {
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
