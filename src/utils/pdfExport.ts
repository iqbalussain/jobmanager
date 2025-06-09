
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Job } from '@/pages/Index';

export const exportJobOrderToPDF = async (job: Job) => {
  try {
    // Create a temporary div with the job order content
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.backgroundColor = '#ffffff';
    element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    element.style.color = '#1f2937';
    element.style.width = '800px';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case "high": return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
        case "medium": return { bg: "#fffbeb", text: "#d97706", border: "#fed7aa" };
        case "low": return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
        default: return { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" };
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "pending": return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
        case "in-progress": return { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" };
        case "completed": return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
        case "cancelled": return { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" };
        case "designing": return { bg: "#faf5ff", text: "#9333ea", border: "#e9d5ff" };
        case "finished": return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
        case "invoiced": return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
        default: return { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" };
      }
    };

    const priorityColors = getPriorityColor(job.priority);
    const statusColors = getStatusColor(job.status);

    element.innerHTML = `
      <div style="max-width: 100%;">
        <!-- Header -->
        <div style="background: linear-gradient(to right, #dbeafe, #e0e7ff); padding: 24px; border-radius: 12px; border: 1px solid #bfdbfe; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;">
                📄 Job Order #${job.jobOrderNumber}
              </h1>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <span style="background: ${priorityColors.bg}; color: ${priorityColors.text}; border: 1px solid ${priorityColors.border}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                  ${job.priority} priority
                </span>
                <span style="background: ${statusColors.bg}; color: ${statusColors.text}; border: 1px solid ${statusColors.border}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                  ${job.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Details -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <div>
            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Job Title</label>
              <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">${job.title}</p>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Description</label>
              <p style="color: #6b7280; margin: 0; line-height: 1.5;">${job.description}</p>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Priority</label>
              <span style="background: ${priorityColors.bg}; color: ${priorityColors.text}; border: 1px solid ${priorityColors.border}; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                ${job.priority} priority
              </span>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Due Date</label>
              <div style="display: flex; align-items: center; gap: 8px; color: #6b7280;">
                <span>📅</span>
                <span>${new Date(job.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Customer</label>
              <div style="display: flex; align-items: center; gap: 8px; color: #6b7280;">
                <span>🏢</span>
                <span>${job.customer}</span>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Assignee</label>
              <div style="display: flex; align-items: center; gap: 8px; color: #6b7280;">
                <span>👤</span>
                <span>${job.assignee}</span>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Designer</label>
              <div style="display: flex; align-items: center; gap: 8px; color: #6b7280;">
                <span>👤</span>
                <span>${job.designer}</span>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Salesman</label>
              <div style="display: flex; align-items: center; gap: 8px; color: #6b7280;">
                <span>👤</span>
                <span>${job.salesman}</span>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Estimated Hours</label>
              <div style="display: flex; align-items: center; gap: 8px; color: #6b7280;">
                <span>⏰</span>
                <span>${job.estimatedHours} hours</span>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Branch</label>
              <p style="color: #6b7280; margin: 0;">${job.branch || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Job Order Details -->
        <div style="margin-bottom: 24px;">
          <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 8px;">Job Order Details</label>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; white-space: pre-wrap; line-height: 1.5;">
              ${job.jobOrderDetails || 'No additional details provided.'}
            </p>
          </div>
        </div>

        <!-- Timestamps -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <div>
            <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Created At</label>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">${new Date(job.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <label style="font-weight: 600; color: #374151; font-size: 14px; display: block; margin-bottom: 4px;">Generated</label>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(element);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(element);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`job-order-${job.jobOrderNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
