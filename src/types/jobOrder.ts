
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
  status: 'pending' | 'working' | 'designing' | 'completed' | 'finished' | 'cancelled' | 'invoiced';
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  branch: string | null;
  job_order_details: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  customer: Customer | null;
  designer: Designer | null;
  salesman: Salesman | null;
  job_title: JobTitle | null;
  title?: string;
  description?: string;
}
