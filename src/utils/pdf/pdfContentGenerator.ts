import { Job } from '@/types/job';

export const generatePDFContent = (job: Job, invoiceNumber?: string) => {
  const invoiceSection = invoiceNumber 
    ? `<div class="invoice-section">
         <h2>Invoice Information</h2>
         <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
       </div>`
    : '';

  return `
    <div class="job-order-content">
      <div class="header-section">
        <h1>Job Order Details</h1>
      </div>
      
      ${invoiceSection}
      
      <div class="job-details-section">
        <h2>Job Details</h2>
        <div class="detail-row">
          <span class="label">Job Order Number:</span>
          <span class="value">${job.jobOrderNumber}</span>
        </div>
        <div class="detail-row">
          <span class="label">Title:</span>
          <span class="value">${job.title}</span>
        </div>
        <div class="detail-row">
          <span class="label">Customer:</span>
          <span class="value">${job.customer}</span>
        </div>
        <div class="detail-row">
          <span class="label">Salesman:</span>
          <span class="value">${job.salesman}</span>
        </div>
        <div class="detail-row">
          <span class="label">Due Date:</span>
          <span class="value">${new Date(job.dueDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="label">Priority:</span>
          <span class="value">${job.priority}</span>
        </div>
        <div class="detail-row">
          <span class="label">Status:</span>
          <span class="value">${job.status}</span>
        </div>
        <div class="detail-row">
          <span class="label">Branch:</span>
          <span class="value">${job.branch || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Delivered At:</span>
          <span class="value">${job.deliveredAt || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Estimated Hours:</span>
          <span class="value">${job.estimatedHours}</span>
        </div>
      </div>
      
      ${job.jobOrderDetails ? `
        <div class="job-order-details-section">
          <h2>Job Order Details</h2>
          <div class="details-content">
            ${job.jobOrderDetails}
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

export const generateJobOrderContent = (doc: any, job: Job, x: number, y: number) => {
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
