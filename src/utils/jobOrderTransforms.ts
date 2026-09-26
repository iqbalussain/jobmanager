import type { DexieJobOrder } from '@/lib/dexieDb';
import type { DashboardJob, JobOrder, JobOrderListRecord } from '@/types/jobOrder';
import { sanitizeHtml } from '@/utils/inputValidation';

export function transformJobOrderData(data: JobOrderListRecord[]): JobOrder[] {
  return data.map((order) => {
    const customer = order.customer
      ? { ...order.customer, name: sanitizeHtml(order.customer.name) }
      : null;
    const designer = order.designer
      ? { ...order.designer, name: sanitizeHtml(order.designer.name) }
      : null;
    const salesman = order.salesman
      ? { ...order.salesman, name: sanitizeHtml(order.salesman.name) }
      : null;
    const jobTitle = order.job_title
      ? { ...order.job_title, job_title_id: sanitizeHtml(order.job_title.job_title_id) }
      : null;
    const details = order.job_order_details || '';

    return {
      ...order,
      customer,
      designer,
      salesman,
      job_title: jobTitle,
      title: jobTitle?.job_title_id || sanitizeHtml(details || `Job Order ${order.job_order_number}`),
      description: sanitizeHtml(details),
    };
  });
}

export function transformDexieJobOrder(order: DexieJobOrder): DashboardJob {
  const today = new Date().toISOString().split('T')[0];

  return {
    id: order.id,
    jobOrderNumber: order.job_order_number,
    title: order.job_title ?? order.job_title_id ?? `Job Order ${order.job_order_number}`,
    jobOrderDetails: order.job_order_details || '',
    customer: order.customer_name || 'Unknown Customer',
    assignee: order.assignee || 'Unassigned',
    priority: order.priority,
    status: order.status,
    dueDate: order.due_date || today,
    createdAt: order.created_at.split('T')[0] || today,
    estimatedHours: order.estimated_hours || 0,
    branch: order.branch || '',
    designer: order.designer_name || 'Unassigned',
    salesman: order.salesman_name || 'Unassigned',
    totalValue: order.total_value || 0,
    created_by: order.created_by,
    invoiceNumber: order.invoice_number || '',
    approval_status: order.approval_status,
    deliveredAt: order.delivered_at || '',
    clientName: order.client_name || '',
    customer_id: order.customer_id,
    job_title_id: order.job_title_id ?? undefined,
  };
}
