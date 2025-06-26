
import { jsPDF } from 'jspdf';

export const generateJobOrderPDF = async (job: any, invoiceNumber?: string) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF('portrait', 'mm', 'a4'); // Changed to portrait for better readability
  
  const pageWidth = 210; // A4 portrait width
  const pageHeight = 297; // A4 portrait height
  const margin = 20;
  
  // Colors for professional design
  const primaryColor = '#1e40af'; // Professional blue
  const lightGray = '#f8fafc';
  const darkGray = '#374151';
  const mediumGray = '#6b7280';
  
  // Header section with company branding
  doc.setFillColor(30, 64, 175); // Primary blue
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Company title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('JOB ORDER', margin, 22);
  
  // Job order number
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${job.job_order_number}`, pageWidth - margin - 50, 18);
  
  // Invoice number if provided
  if (invoiceNumber) {
    doc.setFontSize(14);
    doc.text(`Invoice: ${invoiceNumber}`, pageWidth - margin - 50, 28);
  }
  
  let yPos = 50;
  
  // Job Information Section
  createSection(doc, margin, yPos, pageWidth - 2 * margin, 'JOB INFORMATION', [
    ['Job Order Number', job.job_order_number],
    ['Customer', job.customer?.name || 'N/A'],
    ['Job Title', job.job_title?.job_title_id || 'N/A'],
    ['Status', capitalizeStatus(job.status)],
    ['Priority', capitalizePriority(job.priority)],
    ['Branch', job.branch || 'N/A']
  ], primaryColor, darkGray);
  
  yPos += 85;
  
  // Schedule & Team Section
  createSection(doc, margin, yPos, pageWidth - 2 * margin, 'SCHEDULE & TEAM', [
    ['Due Date', job.due_date ? formatDate(job.due_date) : 'N/A'],
    ['Estimated Hours', `${job.estimated_hours || 0} hours`],
    ['Actual Hours', `${job.actual_hours || 0} hours`],
    ['Designer', job.designer?.name || 'Not Assigned'],
    ['Salesman', job.salesman?.name || 'Not Assigned'],
    ['Assignee', job.assignee || 'Not Assigned']
  ], primaryColor, darkGray);
  
  yPos += 95;
  
  // Job Details Section
  if (job.job_order_details) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 50, 3, 3, 'F');
    
    // Section header
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('JOB ORDER DETAILS', margin + 8, yPos + 8);
    
    // Details content
    doc.setTextColor(darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const detailsLines = doc.splitTextToSize(job.job_order_details, pageWidth - 2 * margin - 16);
    doc.text(detailsLines, margin + 8, yPos + 20);
    
    yPos += 60;
  }
  
  // Footer
  const footerY = pageHeight - 30;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setTextColor(mediumGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, margin, footerY + 10);
  doc.text(`Generated at: ${new Date().toLocaleTimeString()}`, margin, footerY + 18);
  doc.text('Page 1 of 1', pageWidth - margin - 25, footerY + 10);
  
  return doc;
};

function createSection(
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
  const headerHeight = 15;
  
  // Section header
  doc.setFillColor(headerColor);
  doc.roundedRect(x, y, width, headerHeight, 3, 3, 'F');
  
  // Section title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + 8, y + 10);
  
  // Data rows with clean formatting
  data.forEach((row, index) => {
    const rowY = y + headerHeight + (index * rowHeight);
    
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(x, rowY, width, rowHeight, 'F');
    
    // Label (left side)
    doc.setTextColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(row[0] + ':', x + 8, rowY + 8);
    
    // Value (right side)
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], x + width/2, rowY + 8);
  });
  
  // Section border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, headerHeight + (data.length * rowHeight), 3, 3, 'S');
}

function capitalizeStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'designing': 'Designing',
    'completed': 'Completed',
    'finished': 'Finished',
    'cancelled': 'Cancelled',
    'invoiced': 'Invoiced'
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

function capitalizePriority(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    'low': 'Low Priority',
    'medium': 'Medium Priority',
    'high': 'High Priority', 
    'urgent': 'Urgent Priority'
  };
  return priorityMap[priority] || priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}
