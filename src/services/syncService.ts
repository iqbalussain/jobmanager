import { db, DexieJobOrder, clearAllData } from '@/lib/dexieDb';
import { supabase } from '@/integrations/supabase/client';

const SYNC_META_ID = 'main';
const SYNC_INTERVAL = 30000; // 30 seconds

let syncIntervalId: ReturnType<typeof setInterval> | null = null;

// Get last sync time
async function getLastSyncTime(): Promise<string | null> {
  const meta = await db.syncMeta.get(SYNC_META_ID);
  return meta?.lastSyncTime || null;
}

// Update last sync time
async function setLastSyncTime(time: string) {
  await db.syncMeta.put({ id: SYNC_META_ID, lastSyncTime: time, syncInProgress: false });
}

// Check if initial sync is needed
export async function needsInitialSync(): Promise<boolean> {
  const count = await db.jobs.count();
  return count === 0;
}

// Perform full initial sync
export async function performInitialSync(): Promise<void> {
  console.log('[Sync] Starting initial sync...');
  
  try {
    // Fetch all reference data first
    await syncReferenceData();
    
    // Fetch all jobs in batches
    const { count } = await supabase
      .from('job_orders')
      .select('*', { count: 'exact', head: true });
    
    const BATCH_SIZE = 1000;
    const totalBatches = Math.ceil((count || 0) / BATCH_SIZE);
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const from = batch * BATCH_SIZE;
      const to = from + BATCH_SIZE - 1;
      
      const { data: jobOrders, error } = await supabase
        .from('job_orders')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (jobOrders && jobOrders.length > 0) {
        const enrichedJobs = await enrichJobOrders(jobOrders);
        await db.jobs.bulkPut(enrichedJobs);
      }
    }
    
    await setLastSyncTime(new Date().toISOString());
    console.log(`[Sync] Initial sync complete. ${count} jobs loaded.`);
  } catch (error) {
    console.error('[Sync] Initial sync failed:', error);
    throw error;
  }
}

// Sync reference data (customers, salesmen, designers, job titles)
async function syncReferenceData(): Promise<void> {
  const [customersRes, profilesRes, jobTitlesRes] = await Promise.all([
    supabase.from('customers').select('id, name'),
    supabase.from('profiles').select('id, full_name, email, phone, role'),
    supabase.from('job_titles').select('id, job_title_id')
  ]);
  
  if (customersRes.data) {
    await db.customers.bulkPut(customersRes.data.map(c => ({ id: c.id, name: c.name })));
  }
  
  if (profilesRes.data) {
    const salesmen = profilesRes.data
      .filter(p => p.role === 'salesman' || p.role === 'admin' || p.role === 'manager')
      .map(p => ({ id: p.id, name: p.full_name || 'Unknown', email: p.email, phone: p.phone }));
    
    const designers = profilesRes.data
      .filter(p => p.role === 'designer' || p.role === 'admin' || p.role === 'manager')
      .map(p => ({ id: p.id, name: p.full_name || 'Unknown', phone: p.phone }));
    
    await db.salesmen.bulkPut(salesmen);
    await db.designers.bulkPut(designers);
  }
  
  if (jobTitlesRes.data) {
    await db.jobTitles.bulkPut(jobTitlesRes.data);
  }
}

// Enrich job orders with related data from Dexie
async function enrichJobOrders(jobOrders: any[]): Promise<DexieJobOrder[]> {
  const customerIds = [...new Set(jobOrders.map(j => j.customer_id).filter(Boolean))] as string[];
  const salesmanIds = [...new Set(jobOrders.map(j => j.salesman_id).filter(Boolean))] as string[];
  const designerIds = [...new Set(jobOrders.map(j => j.designer_id).filter(Boolean))] as string[];
  const jobTitleIds = [...new Set(jobOrders.map(j => j.job_title_id).filter(Boolean))] as string[];
  
  const [customers, salesmen, designers, jobTitles] = await Promise.all([
    customerIds.length > 0 ? db.customers.where('id').anyOf(customerIds).toArray() : [],
    salesmanIds.length > 0 ? db.salesmen.where('id').anyOf(salesmanIds).toArray() : [],
    designerIds.length > 0 ? db.designers.where('id').anyOf(designerIds).toArray() : [],
    jobTitleIds.length > 0 ? db.jobTitles.where('id').anyOf(jobTitleIds).toArray() : []
  ]);
  
  const customerMap = new Map<string, string>();
  customers.forEach(c => customerMap.set(c.id, c.name));
  
  const salesmanMap = new Map<string, string>();
  salesmen.forEach(s => salesmanMap.set(s.id, s.name));
  
  const designerMap = new Map<string, string>();
  designers.forEach(d => designerMap.set(d.id, d.name));
  
  const jobTitleMap = new Map<string, string>();
  jobTitles.forEach(j => jobTitleMap.set(j.id, j.job_title_id));
  
  const customerObjects = new Map<string, { id: string; name: string }>();
  customers.forEach(c => customerObjects.set(c.id, { id: c.id, name: c.name }));

  return jobOrders.map(job => ({
    id: job.id,
    job_order_number: job.job_order_number,
    customer_id: job.customer_id,
    customer_name: customerObjects.get(job.customer_id)?.name || 'Unknown Customer',
    job_title_id: job.job_title_id,
    job_title: jobTitleMap.get(job.job_title_id) || 'No Title',
    designer_id: job.designer_id,
    designer_name: designerMap.get(job.designer_id) || 'Unassigned',
    salesman_id: job.salesman_id,
    salesman_name: salesmanMap.get(job.salesman_id) || 'Unassigned',
    status: job.status,
    priority: job.priority,
    branch: job.branch,
    assignee: job.assignee,
    due_date: job.due_date,
    estimated_hours: job.estimated_hours,
    actual_hours: job.actual_hours,
    total_value: job.total_value,
    invoice_number: job.invoice_number,
    job_order_details: job.job_order_details,
    client_name: job.client_name,
    delivered_at: job.delivered_at,
    approval_status: job.approval_status,
    approval_notes: job.approval_notes,
    approved_by: job.approved_by,
    approved_at: job.approved_at,
    created_by: job.created_by,
    created_at: job.created_at,
    updated_at: job.updated_at,
    description: job.description,
    description_plain: job.description_plain
  }));
}

// Delta sync - fetch only updated records
export async function performDeltaSync(): Promise<number> {
  const lastSync = await getLastSyncTime();
  
  if (!lastSync) {
    await performInitialSync();
    return 0;
  }
  
  console.log('[Sync] Delta sync from:', lastSync);
  
  try {
    // Sync reference data first
    await syncReferenceData();
    
    // Fetch only jobs updated since last sync
    const { data: updatedJobs, error } = await supabase
      .from('job_orders')
      .select('*')
      .gt('updated_at', lastSync)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    if (updatedJobs && updatedJobs.length > 0) {
      const enrichedJobs = await enrichJobOrders(updatedJobs);
      await db.jobs.bulkPut(enrichedJobs);
      console.log(`[Sync] Delta sync complete. ${updatedJobs.length} jobs updated.`);
    } else {
      console.log('[Sync] Delta sync complete. No changes.');
    }
    
    await setLastSyncTime(new Date().toISOString());
    return updatedJobs?.length || 0;
  } catch (error) {
    console.error('[Sync] Delta sync failed:', error);
    throw error;
  }
}

// Start background sync
export function startBackgroundSync() {
  if (syncIntervalId) return;
  
  syncIntervalId = setInterval(async () => {
    try {
      await performDeltaSync();
    } catch (error) {
      console.error('[Sync] Background sync error:', error);
    }
  }, SYNC_INTERVAL);
  
  console.log('[Sync] Background sync started (every 30s)');
}

// Stop background sync
export function stopBackgroundSync() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('[Sync] Background sync stopped');
  }
}

// Force full resync
export async function forceFullResync(): Promise<void> {
  await clearAllData();
  await performInitialSync();
}

// Update a single job in Dexie after Supabase write
export async function updateJobInCache(jobId: string): Promise<void> {
  const { data: job, error } = await supabase
    .from('job_orders')
    .select('*')
    .eq('id', jobId)
    .single();
  
  if (error) throw error;
  
  if (job) {
    const [enriched] = await enrichJobOrders([job]);
    await db.jobs.put(enriched);
  }
}

// Add a new job to Dexie after Supabase insert
export async function addJobToCache(job: any): Promise<void> {
  const [enriched] = await enrichJobOrders([job]);
  await db.jobs.put(enriched);
}

// Check and repair missing jobs in Dexie
export async function repairMissingJobs(): Promise<number> {
  console.log('[Sync] Checking for missing jobs...');
  
  try {
    // Get all job IDs from Supabase
    const { data: supabaseJobs, error } = await supabase
      .from('job_orders')
      .select('id')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    if (!supabaseJobs) return 0;
    
    // Get all job IDs from Dexie
    const dexieJobIds = new Set(
      (await db.jobs.toArray()).map(j => j.id)
    );
    
    // Find missing jobs
    const missingJobIds = supabaseJobs
      .filter(job => !dexieJobIds.has(job.id))
      .map(job => job.id);
    
    if (missingJobIds.length === 0) {
      console.log('[Sync] No missing jobs found.');
      return 0;
    }
    
    console.log(`[Sync] Found ${missingJobIds.length} missing jobs, syncing...`);
    
    // Fetch and sync missing jobs in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < missingJobIds.length; i += BATCH_SIZE) {
      const batchIds = missingJobIds.slice(i, i + BATCH_SIZE);
      const { data: jobs, error: batchError } = await supabase
        .from('job_orders')
        .select('*')
        .in('id', batchIds);
      
      if (batchError) throw batchError;
      
      if (jobs && jobs.length > 0) {
        const enrichedJobs = await enrichJobOrders(jobs);
        await db.jobs.bulkPut(enrichedJobs);
      }
    }
    
    console.log(`[Sync] Repaired ${missingJobIds.length} missing jobs.`);
    return missingJobIds.length;
  } catch (error) {
    console.error('[Sync] Repair missing jobs failed:', error);
    return 0;
  }
}
