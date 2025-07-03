
export type JobStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "designing"
  | "finished"
  | "invoiced";

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
}
