
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
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 24px; border-radius: 12px; margin-bottom: 32px; color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 24px;">✓</span>
                <h1 style="font-size: 28px; font-weight: bold; margin: 0;">${job.jobOrderNumber}</h1>
              </div>
              <h2 style="font-size: 20px; margin: 0; opacity: 0.9;">${job.title}</h2>
            </div>
            <div style="text-align: right;">
              <div style="display: flex; gap: 12px; align-items: center;">
                <span style="background: ${statusColors.bg}; color: ${statusColors.text}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                  ${job.status.replace('-', ' ')}
                </span>
                <span style="background: ${priorityColors.bg}; color: ${priorityColors.text}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                  ${job.priority} PRIORITY
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
          
          <!-- Customer & Team Section -->
          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: #3b82f6;">
              <span style="font-size: 20px;">👥</span>
              <h3 style="font-size: 18px; font-weight: bold; margin: 0;">Customer & Team</h3>
            </div>
            
            <div style="space-y: 16px;">
              <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Customer:</label>
                <p style="font-size: 16px; color: #1e293b; margin: 0; font-weight: 500;">${job.customer}</p>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Assignee:</label>
                <p style="color: #64748b; margin: 0;">${job.assignee || 'Unassigned'}</p>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Designer:</label>
                <p style="color: #64748b; margin: 0;">${job.designer || 'Not assigned'}</p>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Salesman:</label>
                <p style="color: #64748b; margin: 0;">${job.salesman || 'Not assigned'}</p>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Branch:</label>
                <p style="color: #64748b; margin: 0;">${job.branch || 'Head Office'}</p>
              </div>
            </div>
          </div>

          <!-- Timeline & Details Section -->
          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: #3b82f6;">
              <span style="font-size: 20px;">📅</span>
              <h3 style="font-size: 18px; font-weight: bold; margin: 0;">Timeline & Details</h3>
            </div>
            
            <div style="space-y: 16px;">
              <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Created Date:</label>
                <p style="color: #64748b; margin: 0;">${new Date(job.createdAt).toLocaleDateString()}</p>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Due Date:</label>
                <p style="color: #64748b; margin: 0;">${new Date(job.dueDate).toLocaleDateString()}</p>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Est. Hours:</label>
                <p style="color: #64748b; margin: 0;">${job.estimatedHours} hours</p>
              </div>

              <div style="margin-bottom: 16px;">
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Priority:</label>
                <span style="background: ${priorityColors.bg}; color: ${priorityColors.text}; border: 2px solid ${priorityColors.border}; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                  ${job.priority}
                </span>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 4px;">Status:</label>
                <span style="background: ${statusColors.bg}; color: ${statusColors.text}; border: 2px solid ${statusColors.border}; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                  ${job.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Description Section -->
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; color: #3b82f6;">
            <span style="font-size: 20px;">📝</span>
            <h3 style="font-size: 18px; font-weight: bold; margin: 0;">Job Description</h3>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 15px;">
              ${job.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <!-- Job Order Details Section -->
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; color: #3b82f6;">
            <span style="font-size: 20px;">📋</span>
            <h3 style="font-size: 18px; font-weight: bold; margin: 0;">Job Order Details</h3>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="color: #475569; margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 15px;">
              ${job.jobOrderDetails || 'No additional details provided.'}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8;">
          <p style="margin: 0; font-size: 14px; font-weight: 500;">JobFlow Management System</p>
          <p style="margin: 4px 0 0 0; font-size: 12px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
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
