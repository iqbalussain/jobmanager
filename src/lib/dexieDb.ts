import Dexie, { Table } from 'dexie';

export interface DexieJobOrder {
  id: string;
  job_order_number: string;
  customer_id: string;
  customer_name?: string;
  job_title_id?: string;
  job_title?: string;
  designer_id?: string;
  designer_name?: string;
  salesman_id?: string;
  salesman_name?: string;
  status: string;
  priority: string;
  branch?: string;
  assignee?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  total_value?: number;
  invoice_number?: string;
  job_order_details?: string;
  client_name?: string;
  delivered_at?: string;
  approval_status: string;
  approval_notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DexieCustomer {
  id: string;
  name: string;
}

export interface DexieSalesman {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface DexieDesigner {
  id: string;
  name: string;
  phone?: string;
}

export interface DexieJobTitle {
  id: string;
  job_title_id: string;
}

export interface DexieSyncMeta {
  id: string;
  lastSyncTime: string;
  syncInProgress: boolean;
}

class JobOrderDatabase extends Dexie {
  jobs!: Table<DexieJobOrder>;
  customers!: Table<DexieCustomer>;
  salesmen!: Table<DexieSalesman>;
  designers!: Table<DexieDesigner>;
  jobTitles!: Table<DexieJobTitle>;
  syncMeta!: Table<DexieSyncMeta>;

  constructor() {
    super('JobOrderDB');
    
    this.version(1).stores({
      jobs: 'id, job_order_number, customer_id, customer_name, salesman_id, salesman_name, designer_id, status, branch, priority, created_at, updated_at',
      customers: 'id, name',
      salesmen: 'id, name',
      designers: 'id, name',
      jobTitles: 'id, job_title_id',
      syncMeta: 'id'
    });
  }
}

export const db = new JobOrderDatabase();

// Helper to clear all data (useful for full resync)
export async function clearAllData() {
  await db.jobs.clear();
  await db.customers.clear();
  await db.salesmen.clear();
  await db.designers.clear();
  await db.jobTitles.clear();
  await db.syncMeta.clear();
}
