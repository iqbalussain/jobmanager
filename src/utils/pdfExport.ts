
import { Job } from '@/pages/Index';
import { generateJobOrderPDF } from './pdf/pdfContentGenerator';

export const exportJobOrderToPDF = async (job: Job, invoiceNumber?: string) => {
  try {
    const doc = await generateJobOrderPDF(job, invoiceNumber);
    
    const fileName = invoiceNumber 
      ? `invoice-${invoiceNumber}-job-${job.jobOrderNumber}.pdf`
      : `job-order-${job.jobOrderNumber}.pdf`;

    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
