
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Job } from '@/pages/Index';
import { createStyledElement } from './pdfStyles';
import { generatePDFContent } from './pdfContentGenerator';

export const shareJobOrderViaWhatsApp = async (job: Job, invoiceNumber?: string) => {
  try {
    // Create a temporary div with the job order content
    const element = createStyledElement();
    element.innerHTML = generatePDFContent(job, invoiceNumber);
    
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
        title: `Job Order #${job.jobOrderNumber} - ${job.customer}`,
        text: `Job Order Details for ${job.customer}`,
        files: [file]
      });
    } else {
      // Fallback: Open WhatsApp Web with text message
      const message = encodeURIComponent(
        `🏢 *CLIENT: ${job.customer.toUpperCase()}*\n\n` +
        `📋 *Job Order #${job.jobOrderNumber}*\n` +
        `📝 *Title:* ${job.title}\n` +
        `📊 *Status:* ${job.status}\n` +
        `📅 *Due Date:* ${new Date(job.dueDate).toLocaleDateString()}\n` +
        `⚡ *Priority:* ${job.priority.toUpperCase()}\n` +
        `👤 *Assignee:* ${job.assignee || 'Unassigned'}\n` +
        `🎨 *Designer:* ${job.designer || 'Not assigned'}\n` +
        `💼 *Salesman:* ${job.salesman || 'Not assigned'}\n` +
        `🏪 *Branch:* ${job.branch || 'Head Office'}\n` +
        (invoiceNumber ? `🧾 *Invoice:* ${invoiceNumber}\n` : '') +
        (job.totalValue ? `💰 *Total Value:* ${job.totalValue}\n` : '') +
        '\n📋 Job order document image attached above'
      );
      
      // Create a download link for the image
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-order-${job.jobOrderNumber}-${job.customer.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
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
