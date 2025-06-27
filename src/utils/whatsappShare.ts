
import html2canvas from 'html2canvas';
import { Job } from '@/pages/Index';
import { createStyledElement } from './pdf/pdfStyles';

const generateJobOrderHTML = (job: Job, invoiceNumber?: string): string => {
  return `
    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #333;">Job Order #${job.jobOrderNumber}</h1>
        ${invoiceNumber ? `<p style="margin: 5px 0; font-weight: bold;">Invoice: ${invoiceNumber}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Job Details</h2>
        <p><strong>Customer:</strong> ${job.customer}</p>
        <p><strong>Title:</strong> ${job.title}</p>
        <p><strong>Status:</strong> ${job.status}</p>
        <p><strong>Priority:</strong> ${job.priority}</p>
        <p><strong>Due Date:</strong> ${job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Estimated Hours:</strong> ${job.estimatedHours || 'N/A'}</p>
        <p><strong>Branch:</strong> ${job.branch || 'N/A'}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Team</h2>
        <p><strong>Designer:</strong> ${job.designer || 'N/A'}</p>
        <p><strong>Salesman:</strong> ${job.salesman || 'N/A'}</p>
        <p><strong>Assignee:</strong> ${job.assignee || 'N/A'}</p>
      </div>
      
      ${job.jobOrderDetails ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Job Order Details</h2>
          <p>${job.jobOrderDetails}</p>
        </div>
      ` : ''}
    </div>
  `;
};

export const shareJobOrderViaWhatsApp = async (job: Job, invoiceNumber?: string) => {
  try {
    // Create a temporary div with the job order content
    const element = createStyledElement();
    element.innerHTML = generateJobOrderHTML(job, invoiceNumber);
    
    // Make the element visible but positioned off-screen
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';
    
    document.body.appendChild(element);

    // Convert to canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 800,
      height: 1200
    });

    // Remove the temporary element
    document.body.removeChild(element);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png', 1.0);
    });

    // Check if Web Share API is supported and can share files
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'job-order.png', { type: 'image/png' })] })) {
      const file = new File([blob], `job-order-${job.jobOrderNumber}.png`, { type: 'image/png' });
      
      await navigator.share({
        title: `Job Order #${job.jobOrderNumber}`,
        text: `Job Order Details for ${job.customer}`,
        files: [file]
      });
    } else {
      // Fallback: Open WhatsApp Web with text message
      const message = encodeURIComponent(
        `Job Order #${job.jobOrderNumber}\n` +
        `Customer: ${job.customer}\n` +
        `Title: ${job.title}\n` +
        `Status: ${job.status}\n` +
        `Due Date: ${new Date(job.dueDate).toLocaleDateString()}\n` +
        `Priority: ${job.priority}\n` +
        (invoiceNumber ? `Invoice: ${invoiceNumber}\n` : '') +
        '\n📋 Job order image attached above'
      );
      
      // Create a download link for the image
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-order-${job.jobOrderNumber}.png`;
      link.click();
      URL.revokeObjectURL(url);
      
      // Open WhatsApp Web
      const whatsappUrl = `https://web.whatsapp.com/send?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    throw new Error('Failed to share job order via WhatsApp');
  }
};
