import { jsPDF } from 'jspdf';
import { Job } from '@/types/job';
import { createStyledElement } from './pdf/pdfStyles';
import { generatePDFContent } from './pdf/pdfContentGenerator';
import { generatePDFFromElement } from './pdf/pdfGenerator';

export const exportJobOrderToPDF = async (job: Job, invoiceNumber?: string) => {
  try {
    // Create a temporary div with the job order content
    const element = createStyledElement();
    element.innerHTML = generatePDFContent(job, invoiceNumber);

    document.body.appendChild(element);

    const fileName = invoiceNumber 
      ? `invoice-${invoiceNumber}-job-${job.jobOrderNumber}.pdf`
      : `job-order-${job.jobOrderNumber}.pdf`;

    await generatePDFFromElement(element, fileName);

    document.body.removeChild(element);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
