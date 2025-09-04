import { supabase } from '@/integrations/supabase/client';

export async function fetchJobOrders() {
  console.log('Fetching all job orders...');
  const { data, error, count } = await supabase
    .from('job_orders')
    .select(`
      *,
      customer:customers!fk_job_orders_customer(id, name),
      job_title:job_titles(id, job_title_id)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });
  
  console.log(`Total job orders in database: ${count}`);
  console.log(`Fetched job orders count: ${data?.length || 0}`);
  
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
