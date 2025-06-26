
import { JobOrder } from '@/types/jobOrder';
import { Job } from '@/pages/Index';

export function transformJobOrderData(data: JobOrder[]): Job[] {
  return data.map(jobOrder => {
    // Calculate actual hours if job is completed
    let actualHours = jobOrder.actual_hours || 0;
    
    if (jobOrder.status === 'completed' && jobOrder.created_at) {
      const createdAt = new Date(jobOrder.created_at);
      const completedAt = new Date(jobOrder.updated_at);
      const timeDiffMs = completedAt.getTime() - createdAt.getTime();
      const timeDiffHours = Math.round(timeDiffMs / (1000 * 60 * 60));
      actualHours = timeDiffHours > 0 ? timeDiffHours : 0;
    }

    return {
      id: jobOrder.id,
      jobOrderNumber: jobOrder.job_order_number,
      customer: jobOrder.customer?.name || 'Unknown Customer',
      title: jobOrder.job_title?.job_title_id || 'No Title',
      status: jobOrder.status,
      priority: jobOrder.priority,
      dueDate: jobOrder.due_date,
      estimatedHours: jobOrder.estimated_hours,
      actualHours: actualHours,
      branch: jobOrder.branch,
      designer: jobOrder.designer?.name || 'Not Assigned',
      salesman: jobOrder.salesman?.name || 'Not Assigned',
      assignee: jobOrder.assignee,
      jobOrderDetails: jobOrder.job_order_details,
      createdAt: jobOrder.created_at,
      customer_id: jobOrder.customer_id,
      job_title_id: jobOrder.job_title_id,
      invoiceNumber: jobOrder.invoice_number
    };
  });
}
