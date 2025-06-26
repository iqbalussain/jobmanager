
import { Job } from '@/pages/Index';
import { generateJobOrderPDF } from './pdf/pdfContentGenerator';

export const exportJobOrderToPDF = async (job: Job, invoiceNumber?: string) => {
  try {
    // Transform the Job type to match what generateJobOrderPDF expects
    const jobData = {
      id: job.id,
      job_order_number: job.jobOrderNumber,
      customer: { name: job.customer },
      job_title: { job_title_id: job.title },
      status: job.status,
      priority: job.priority,
      due_date: job.dueDate,
      estimated_hours: job.estimatedHours,
      actual_hours: job.actualHours || 0,
      branch: job.branch,
      designer: { name: job.designer },
      salesman: { name: job.salesman },
      assignee: job.assignee,
      job_order_details: job.jobOrderDetails
    };

    const doc = await generateJobOrderPDF(jobData, invoiceNumber);
    
    const fileName = invoiceNumber 
      ? `invoice-${invoiceNumber}-job-${job.jobOrderNumber}.pdf`
      : `job-order-${job.jobOrderNumber}.pdf`;

    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
