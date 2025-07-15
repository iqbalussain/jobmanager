import jsPDF from 'jspdf';
import { Job } from '@/types/job';

export const generateJobOrderContent = (doc: jsPDF, job: Job, x: number, y: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let currentY = y;

  // Function to add text with auto-wrapping
  const addWrappedText = (text: string, textX: number, textY: number, width: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const textLines = doc.splitTextToSize(text, width - 2 * margin);
    textLines.forEach(line => {
      doc.text(line, textX, textY);
      textY += fontSize / 3.527777778; // Convert pt to mm
    });
    return textY;
  };

  // Function to add a header
  const addHeader = (text: string, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(text, x, currentY);
    currentY += fontSize / 3.527777778 + 2;
    doc.setFont('helvetica', 'normal'); // Reset font
  };

  // Function to add a label-value pair
  const addLabelValuePair = (label: string, value: string, pairWidth: number) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, x, currentY);
    doc.setFont('helvetica', 'normal');
    const valueX = x + 20;
    currentY = addWrappedText(value, valueX, currentY, pairWidth, 10);
    return currentY;
  };

  // Job Details Section
  addHeader('Job Details');
  let pairWidth = (pageWidth - 2 * margin) / 2;
  addLabelValuePair('Job Order Number', job.jobOrderNumber, pairWidth);
  addLabelValuePair('Title', job.title, pairWidth);
  addLabelValuePair('Customer', job.customer, pairWidth);
  addLabelValuePair('Salesman', job.salesman, pairWidth);
  addLabelValuePair('Due Date', new Date(job.dueDate).toLocaleDateString(), pairWidth);
  addLabelValuePair('Priority', job.priority, pairWidth);
  addLabelValuePair('Status', job.status, pairWidth);
  addLabelValuePair('Branch', job.branch || 'N/A', pairWidth);
  addLabelValuePair('Delivered At', job.deliveredAt || 'N/A', pairWidth);
  addLabelValuePair('Estimated Hours', job.estimatedHours.toString(), pairWidth);

  // Job Order Details Section
  if (job.jobOrderDetails) {
    addHeader('Job Order Details');
    currentY = addWrappedText(job.jobOrderDetails, x, currentY, pageWidth - 2 * margin, 10);
  }

  return currentY;
};
