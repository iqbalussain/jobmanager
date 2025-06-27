import { jsPDF } from 'jspdf';

const leftMargin = 15;
let yPos = 20;

const addHeader = (doc: jsPDF, jobOrderNumber: string) => {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Job Order #${jobOrderNumber}`, leftMargin, yPos);
  yPos += 15;
};

const addSectionTitle = (doc: jsPDF, title: string) => {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, leftMargin, yPos);
  yPos += 10;
};

const addField = (doc: jsPDF, label: string, value: string | number | null) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${label}:`, leftMargin, yPos);

  doc.setFont('helvetica', 'normal');
  const text = value !== null ? value.toString() : 'N/A';
  const maxWidth = doc.internal.pageSize.getWidth() - 30; // Total width minus left and right margins
  const textLines = doc.splitTextToSize(text, maxWidth - 20); // Split text to fit within the width

  textLines.forEach(line => {
    doc.text(line, leftMargin + 40, yPos);
    yPos += 7; // Adjust line spacing
  });
  yPos += 3;
};

export const generateJobOrderPDF = async (job: any, invoiceNumber?: string) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  addHeader(doc, job.job_order_number);

  // Job Details Section
  addSectionTitle(doc, 'Job Details');
  addField(doc, 'Customer', job.customer?.name || 'N/A');
  addField(doc, 'Job Title', job.job_title?.job_title_id || 'N/A');
  addField(doc, 'Status', job.status);
  addField(doc, 'Priority', job.priority);
  addField(doc, 'Due Date', job.due_date ? new Date(job.due_date).toLocaleDateString() : 'N/A');
  addField(doc, 'Estimated Hours', job.estimated_hours);
  addField(doc, 'Actual Hours', job.actual_hours);
  addField(doc, 'Branch', job.branch);

  // Team Section
  addSectionTitle(doc, 'Team');
  addField(doc, 'Designer', job.designer?.name || 'N/A');
  addField(doc, 'Salesman', job.salesman?.name || 'N/A');
  addField(doc, 'Assignee', job.assignee || 'N/A');

  // Invoice Section
  if (invoiceNumber) {
    addSectionTitle(doc, 'Invoice Information');
    addField(doc, 'Invoice Number', invoiceNumber);
  }
  
  // Job Order Details Section
  addSectionTitle(doc, 'Job Order Details');
  addField(doc, 'Details', job.job_order_details || 'N/A');
  
  // Add images section if images exist
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const { data: images } = await supabase
      .from('job_order_attachments')
      .select('*')
      .eq('job_order_id', job.id)
      .eq('is_image', true)
      .order('created_at', { ascending: false });

    if (images && images.length > 0) {
      // Add new page for images if needed
      const currentY = doc.internal.pageSize.height - 30; // Check remaining space
      if (currentY < 100) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 20;
      }

      // Images section header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Reference Images', leftMargin, yPos);
      yPos += 15;

      // Add images
      for (let i = 0; i < Math.min(images.length, 4); i++) { // Limit to 4 images for PDF
        const image = images[i];
        
        try {
          // Get image URL
          const { data: { publicUrl } } = supabase.storage
            .from('job-order-images')
            .getPublicUrl(image.file_path);

          // Fetch image as blob
          const response = await fetch(publicUrl);
          const blob = await response.blob();
          
          // Convert to base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          // Calculate image dimensions for PDF (max 80x60)
          const maxWidth = 80;
          const maxHeight = 60;
          let imgWidth = maxWidth;
          let imgHeight = maxHeight;
          
          if (image.image_width && image.image_height) {
            const aspectRatio = image.image_width / image.image_height;
            if (aspectRatio > maxWidth / maxHeight) {
              imgHeight = maxWidth / aspectRatio;
            } else {
              imgWidth = maxHeight * aspectRatio;
            }
          }

          // Check if we need a new page
          if (yPos + imgHeight + 20 > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yPos = 20;
          }

          // Add image to PDF
          doc.addImage(base64, 'JPEG', leftMargin, yPos, imgWidth, imgHeight);
          
          // Add image caption
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          const caption = image.alt_text || image.file_name;
          doc.text(caption.substring(0, 50), leftMargin, yPos + imgHeight + 5);
          
          yPos += imgHeight + 15;
          
        } catch (imageError) {
          console.error('Error adding image to PDF:', imageError);
          // Continue with next image if one fails
        }
      }
      
      if (images.length > 4) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`... and ${images.length - 4} more images`, leftMargin, yPos);
      }
    }
  } catch (error) {
    console.error('Error fetching images for PDF:', error);
    // Continue without images if there's an error
  }

  // Reset yPos for the footer
  yPos = doc.internal.pageSize.height - 10;

  // Add Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Page 1', leftMargin, yPos);

  
  return doc;
};
