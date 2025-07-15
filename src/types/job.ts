
export interface Job {
  id: string;
  jobOrderNumber: string;
  title: string;
  customer: string;
  customer_id?: string;
  job_title_id?: string;
  salesman: string;
  designer?: string;
  assignee?: string;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  estimatedHours: number;
  jobOrderDetails?: string;
  branch?: string;
  deliveredAt?: string;
  totalValue?: number;
  created_by?: string;
}

export type JobStatus = 
  | 'pending' 
  | 'in-progress' 
  | 'designing' 
  | 'completed' 
  | 'finished' 
  | 'invoiced' 
  | 'cancelled';
