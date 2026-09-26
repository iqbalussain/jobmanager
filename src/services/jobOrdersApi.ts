import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { isJobStatus } from '@/types/jobOrder';
import type {
  Customer,
  Designer,
  JobOrderListRecord,
  JobOrderRecord,
  JobOrderUpdate,
  JobStatus,
  JobTitle,
  Salesman,
} from '@/types/jobOrder';

const JOB_LIST_SELECT =
  'id,job_order_number,customer_id,job_title_id,designer_id,salesman_id,status,priority,branch,assignee,due_date,estimated_hours,actual_hours,total_value,invoice_number,job_order_details,client_name,delivered_at,approval_status,approval_notes,approved_by,approved_at,created_by,created_at,updated_at,description_plain,customer:customers!fk_job_orders_customer(id,name),job_title:job_titles(id,job_title_id)' as const;

type JobOrderBaseRecord = Omit<JobOrderRecord, 'description'> & {
  customer: Customer | null;
  job_title: JobTitle | null;
};
type ProfileRecord = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'email' | 'phone'>;

interface JobOrderFilters {
  status?: string;
  branch?: string;
  salesman?: string;
  salesmanId?: string;
  customer?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

function uniqueProfileIds(rows: JobOrderBaseRecord[]): string[] {
  return Array.from(
    new Set(
      rows
        .flatMap((row) => [row.designer_id, row.salesman_id])
        .filter((id): id is string => id !== null),
    ),
  );
}

async function enrichWithProfiles(rows: JobOrderBaseRecord[]): Promise<JobOrderListRecord[]> {
  const profileIds = uniqueProfileIds(rows);
  const profiles: ProfileRecord[] = [];

  if (profileIds.length > 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', profileIds);

    if (error) throw error;
    profiles.push(...(data || []));
  }

  const profileMap = new Map<string, ProfileRecord>();
  profiles.forEach((profile) => profileMap.set(profile.id, profile));

  return rows.map((jobOrder) => {
    const designerProfile = jobOrder.designer_id
      ? profileMap.get(jobOrder.designer_id)
      : undefined;
    const salesmanProfile = jobOrder.salesman_id
      ? profileMap.get(jobOrder.salesman_id)
      : undefined;

    const designer: Designer | null = designerProfile
      ? {
          id: designerProfile.id,
          name: designerProfile.full_name || 'Unknown Designer',
          phone: designerProfile.phone,
        }
      : null;
    const salesman: Salesman | null = salesmanProfile
      ? {
          id: salesmanProfile.id,
          name: salesmanProfile.full_name || 'Unknown Salesman',
          email: salesmanProfile.email,
          phone: salesmanProfile.phone,
        }
      : null;

    return { ...jobOrder, designer, salesman };
  });
}

export async function fetchJobOrders(): Promise<JobOrderListRecord[]> {
  const { count, error: countError } = await supabase
    .from('job_orders')
    .select('id', { count: 'exact', head: true });

  if (countError) throw countError;

  const batchSize = 1000;
  const totalBatches = Math.ceil((count || 0) / batchSize);
  const allJobOrders: JobOrderBaseRecord[] = [];

  for (let batch = 0; batch < totalBatches; batch++) {
    const from = batch * batchSize;
    const to = from + batchSize - 1;
    const { data, error } = await supabase
      .from('job_orders')
      .select(JOB_LIST_SELECT)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;
    allJobOrders.push(...(data || []));
  }

  return enrichWithProfiles(allJobOrders);
}

export async function fetchJobOrdersPaginated(
  page = 1,
  pageSize = 50,
  filters: JobOrderFilters = {},
): Promise<{
  data: JobOrderListRecord[];
  totalCount: number;
  totalPages: number;
}> {
  let query = supabase
    .from('job_orders')
    .select(JOB_LIST_SELECT, { count: 'exact' });

  if (filters.status && filters.status !== 'all') {
    if (!isJobStatus(filters.status)) {
      throw new Error(`Unsupported job status filter: ${filters.status}`);
    }
    query = query.eq('status', filters.status);
  }

  if (filters.branch && filters.branch !== 'all') {
    query = query.ilike('branch', `%${filters.branch}%`);
  }

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

  if (filters.search?.trim()) {
    const searchTerm = filters.search.trim();
    query = query.or(
      `job_order_number.ilike.%${searchTerm}%,job_order_details.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,assignee.ilike.%${searchTerm}%`,
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw error;

  let enrichedData = await enrichWithProfiles(data || []);

  if (!filters.salesmanId && filters.salesman && filters.salesman !== 'all') {
    enrichedData = enrichedData.filter((job) => job.salesman?.name === filters.salesman);
  }

  if (!filters.customerId && filters.customer && filters.customer !== 'all') {
    enrichedData = enrichedData.filter((job) => job.customer?.name === filters.customer);
  }

  const totalCount = count || 0;
  return {
    data: enrichedData,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function updateJobOrder(id: string, updates: JobOrderUpdate): Promise<JobOrderRecord> {
  const { data, error } = await supabase
    .from('job_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function updateJobOrderStatus(
  id: string,
  status: JobStatus,
): Promise<JobOrderRecord> {
  return updateJobOrder(id, { status, updated_at: new Date().toISOString() });
}
