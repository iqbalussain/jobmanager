
export interface Customer {
  id: string;
  name: string;
}

export interface Designer {
  id: string;
  name: string;
  phone: string | null;
}

export interface Salesman {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface JobTitle {
  id: string;
  job_title_id: string;
}

export type JobStatus = 'pending' | 'in-progress' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'invoiced';
export type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface JobOrder {
  id: string;
  job_order_number: string;
  customer_id: string;
  job_type_id: string | null;
  job_title_id: string | null;
  assignee: string | null;
  designer_id: string | null;
  salesman_id: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: JobStatus;
  approval_status: ApprovalStatus;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  branch: string | null;
  job_order_details: string | null;
  total_value: number | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  customer: Customer | null;
  designer: Designer | null;
  salesman: Salesman | null;
  job_title: JobTitle | null;
  title?: string;
  description?: string;
  invoice_number?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  delivered_at?: string | null;
  client_name?: string | null;
}

// Transformed Job interface for UI components
export interface Job {
  id: string;
  jobOrderNumber: string;
  title: string;
  customer: string;
  assignee?: string;
  designer?: string;
  salesman?: string;
  priority: "low" | "medium" | "high";
  status: JobStatus;
  dueDate: string;
  estimatedHours: number;
  createdAt: string;
  branch?: string;
  jobOrderDetails?: string;
  invoiceNumber?: string;
  totalValue?: number;
  customer_id?: string;
  job_title_id?: string;
  created_by?: string;
  approval_status?: string;
  deliveredAt?: string;
  clientName?: string;
}
