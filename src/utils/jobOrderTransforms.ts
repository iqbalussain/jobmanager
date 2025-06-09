
import { sanitizeHtml } from '@/utils/inputValidation';
import { JobOrder, Designer, Salesman, Customer, JobTitle } from '@/types/jobOrder';

export function transformJobOrderData(data: any[]): JobOrder[] {
  return data?.map(order => {
    // Handle designer with proper null checks
    let designer: Designer | null = null;
    if (order.designer && order.designer !== null && typeof order.designer === 'object' && 'id' in order.designer) {
      const designerData = order.designer as any;
      designer = {
        id: designerData.id,
        name: sanitizeHtml(designerData.full_name || 'Unknown Designer'),
        phone: designerData.phone
      };
    }

    // Handle salesman with proper null checks
    let salesman: Salesman | null = null;
    if (order.salesman && order.salesman !== null && typeof order.salesman === 'object' && 'id' in order.salesman) {
      const salesmanData = order.salesman as any;
      salesman = {
        id: salesmanData.id,
        name: sanitizeHtml(salesmanData.full_name || 'Unknown Salesman'),
        email: salesmanData.email,
        phone: salesmanData.phone
      };
    }

    return {
      ...order,
      customer: order.customer && typeof order.customer === 'object' && 'id' in order.customer 
        ? order.customer as Customer 
        : null,
      designer,
      salesman,
      job_title: order.job_title && typeof order.job_title === 'object' && 'id' in order.job_title
        ? order.job_title as JobTitle
        : null,
      // Sanitize displayed content
      title: sanitizeHtml(order.job_order_details || `Job Order ${order.job_order_number}`),
      description: sanitizeHtml(order.job_order_details || '')
    };
  }) || [];
}
