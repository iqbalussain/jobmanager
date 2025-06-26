
import { jsPDF } from 'jspdf';

export const generateJobOrderPDF = async (job: any, invoiceNumber?: string) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF('landscape', 'mm', 'a4'); // A4 Landscape
  
  const pageWidth = 297; // A4 landscape width
  const pageHeight = 210; // A4 landscape height
  const margin = 20;
  
  // Colors for elegant design
  const primaryColor = '#2563eb'; // Blue
  const secondaryColor = '#f8fafc'; // Light gray
  const accentColor = '#1e40af'; // Dark blue
  const textColor = '#1f2937'; // Dark gray
  
  // Header with company branding
  doc.setFillColor(primaryColor);
  doc.roundedRect(margin, margin, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  // Company name/logo area
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('JOB ORDER', margin + 10, margin + 16);
  
  // Job order number on right
  doc.setFontSize(18);
  doc.text(`#${job.job_order_number}`, pageWidth - margin - 60, margin + 16);
  
  // Invoice number if provided
  if (invoiceNumber) {
    doc.setFontSize(14);
    doc.text(`Invoice: ${invoiceNumber}`, pageWidth - margin - 80, margin + 35);
  }
  
  let yPos = margin + 50;
  
  // Main content area with rounded background
  doc.setFillColor(248, 250, 252); // Very light gray
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 120, 5, 5, 'F');
  
  // Create elegant table sections
  const sectionWidth = (pageWidth - 2 * margin - 20) / 2;
  
  // Left section - Job Details
  createElegantSection(doc, margin + 10, yPos + 10, sectionWidth, 'Job Details', [
    ['Customer', job.customer?.name || 'N/A'],
    ['Job Title', job.job_title?.job_title_id || 'N/A'],
    ['Status', job.status.toUpperCase()],
    ['Priority', job.priority.toUpperCase()],
    ['Branch', job.branch || 'N/A']
  ], primaryColor, textColor);
  
  // Right section - Schedule & Team
  createElegantSection(doc, margin + sectionWidth + 20, yPos + 10, sectionWidth, 'Schedule & Team', [
    ['Due Date', job.due_date ? new Date(job.due_date).toLocaleDateString() : 'N/A'],
    ['Estimated Hours', `${job.estimated_hours || 0} hrs`],
    ['Actual Hours', `${job.actual_hours || 0} hrs`],
    ['Designer', job.designer?.name || 'N/A'],
    ['Salesman', job.salesman?.name || 'N/A']
  ], accentColor, textColor);
  
  yPos += 130;
  
  // Job Order Details section
  if (job.job_order_details) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 5, 5, 'F');
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 5, 5, 'S');
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Order Details', margin + 10, yPos + 12);
    
    doc.setTextColor(textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const detailsLines = doc.splitTextToSize(job.job_order_details, pageWidth - 2 * margin - 20);
    doc.text(detailsLines, margin + 10, yPos + 22);
  }
  
  // Footer with elegant styling
  const footerY = pageHeight - 25;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, footerY, pageWidth - 2 * margin, 15, 2, 2, 'F');
  
  doc.setTextColor(textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin + 10, footerY + 10);
  doc.text('Page 1 of 1', pageWidth - margin - 30, footerY + 10);
  
  return doc;
};

function createElegantSection(
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  title: string, 
  data: string[][], 
  headerColor: string, 
  textColor: string
) {
  const rowHeight = 12;
  const headerHeight = 18;
  
  // Section header with rounded top
  doc.setFillColor(headerColor);
  doc.roundedRect(x, y, width, headerHeight, 3, 3, 'F');
  
  // Section title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + 10, y + 12);
  
  // Data rows with alternating colors
  data.forEach((row, index) => {
    const rowY = y + headerHeight + (index * rowHeight);
    
    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(x, rowY, width, rowHeight, 'F');
    
    // Row data
    doc.setTextColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(row[0] + ':', x + 8, rowY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], x + width/2, rowY + 8);
  });
  
  // Section border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, headerHeight + (data.length * rowHeight), 3, 3, 'S');
}
