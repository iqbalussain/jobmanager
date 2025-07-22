export const generatePDFContent = (job: any, invoiceNumber?: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 20px;">

      <!-- Client Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px; color: #0f5132;">CLIENT: ${job.customer}</h1>
        <h2 style="font-size: 14px; margin-top: 4px;">Job Order #: ${job.jobOrderNumber} - ${job.title}</h2>
        ${invoiceNumber ? `<h3 style='font-size: 12px; margin-top: 4px;'>Invoice #: ${invoiceNumber}</h3>` : ''}
      </div>

      <!-- Customer & Team -->
      <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 12px; border-radius: 6px;">
        <strong style="text-decoration: underline; display: block; margin-bottom: 6px;">Customer & Team</strong>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td><strong>Customer:</strong></td><td>${job.customer}</td></tr>
          <tr><td><strong>Assignee:</strong></td><td>${job.assignee || 'Unassigned'}</td></tr>
          <tr><td><strong>Designer:</strong></td><td>${job.designer || 'Not assigned'}</td></tr>
          <tr><td><strong>Salesman:</strong></td><td>${job.salesman || 'Not assigned'}</td></tr>
          <tr><td><strong>Branch:</strong></td><td>${job.branch || 'Head Office'}</td></tr>
          <tr><td><strong>Delivered At:</strong></td><td>${job.deliveredAt || 'Not specified'}</td></tr>
        </table>
      </div>

      <!-- Timeline -->
      <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 12px; border-radius: 6px;">
        <strong style="text-decoration: underline; display: block; margin-bottom: 6px;">Timeline & Details</strong>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td><strong>Created Date:</strong></td><td>${new Date(job.createdAt).toLocaleDateString()}</td></tr>
          <tr><td><strong>Due Date:</strong></td><td>${new Date(job.dueDate).toLocaleDateString()}</td></tr>
          <tr><td><strong>Estimated Hours:</strong></td><td>${job.estimatedHours || 'N/A'} hours</td></tr>
        </table>
      </div>

      <!-- Job Order Details -->
      <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 12px; border-radius: 6px;">
        <strong style="text-decoration: underline; display: block; margin-bottom: 6px;">Job Order Details</strong>
        <div style="white-space: pre-wrap;">${job.jobOrderDetails || 'No additional details provided.'}</div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 10px; color: #777; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p>Professional Job Order Management & Tracking</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  `;
};

