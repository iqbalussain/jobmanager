
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
        case "high": return { bg: "#fee2e2", text: "#dc2626", border: "#fecaca" };
        case "medium": return { bg: "#fef3c7", text: "#d97706", border: "#fed7aa" };
        case "low": return { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" };
        default: return { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "pending": return { bg: "#dbeafe", text: "#2563eb", border: "#bfdbfe" };
        case "in-progress": return { bg: "#fed7aa", text: "#ea580c", border: "#fdba74" };
        case "completed": return { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" };
        case "cancelled": return { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
        case "designing": return { bg: "#e9d5ff", text: "#9333ea", border: "#d8b4fe" };
        case "finished": return { bg: "#d1fae5", text: "#059669", border: "#a7f3d0" };
        case "invoiced": return { bg: "#d1fae5", text: "#059669", border: "#a7f3d0" };
        default: return { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
      }
    };

    const priorityColors = getPriorityColor(job.priority);
    const statusColors = getStatusColor(job.status);

    element.innerHTML = `
      <div style="max-width: 100%; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 32px; border-radius: 16px; margin-bottom: 40px; color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                  <span style="font-size: 20px; font-weight: bold;">✓</span>
                </div>
                <h1 style="font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">${job.jobOrderNumber}</h1>
              </div>
              <h2 style="font-size: 22px; margin: 0; opacity: 0.95; font-weight: 500; line-height: 1.3;">${job.title}</h2>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-end;">
              <div style="background: ${statusColors.bg}; color: ${statusColors.text}; padding: 10px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid ${statusColors.border}; min-width: 120px; text-align: center;">
                ${job.status.replace('-', ' ')}
              </div>
              <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; padding: 10px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid ${priorityColors.border}; min-width: 120px; text-align: center;">
                ${job.priority} PRIORITY
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
          
          <!-- Customer & Team Section -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #cbd5e1; border-radius: 16px; padding: 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: #1e40af;">
              <div style="width: 32px; height: 32px; background: #dbeafe; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 18px;">👥</span>
              </div>
              <h3 style="font-size: 20px; font-weight: 700; margin: 0;">Customer & Team</h3>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Customer:</label>
                <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <p style="font-size: 16px; color: #1e293b; margin: 0; font-weight: 600;">${job.customer}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Assignee:</label>
                <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <p style="color: #64748b; margin: 0;">${job.assignee || 'Unassigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Designer:</label>
                <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <p style="color: #64748b; margin: 0;">${job.designer || 'Not assigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Salesman:</label>
                <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <p style="color: #64748b; margin: 0;">${job.salesman || 'Not assigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Branch:</label>
                <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <p style="color: #64748b; margin: 0;">${job.branch || 'Head Office'}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline & Details Section -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #bbf7d0; border-radius: 16px; padding: 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: #16a34a;">
              <div style="width: 32px; height: 32px; background: #dcfce7; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 18px;">📅</span>
              </div>
              <h3 style="font-size: 20px; font-weight: 700; margin: 0;">Timeline & Details</h3>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Created Date:</label>
                <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #bbf7d0;">
                  <p style="color: #64748b; margin: 0;">${new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Due Date:</label>
                <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #bbf7d0;">
                  <p style="color: #64748b; margin: 0;">${new Date(job.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Est. Hours:</label>
                <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #bbf7d0;">
                  <p style="color: #64748b; margin: 0;">${job.estimatedHours} hours</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Priority:</label>
                <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; border: 2px solid ${priorityColors.border}; padding: 10px 16px; border-radius: 12px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                  ${job.priority} PRIORITY
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; font-size: 14px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Status:</label>
                <div style="background: ${statusColors.bg}; color: ${statusColors.text}; border: 2px solid ${statusColors.border}; padding: 10px 16px; border-radius: 12px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                  ${job.status.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Description Section -->
        <div style="background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); border: 2px solid #fed7aa; border-radius: 16px; padding: 28px; margin-bottom: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: #d97706;">
            <div style="width: 32px; height: 32px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 18px;">📝</span>
            </div>
            <h3 style="font-size: 20px; font-weight: 700; margin: 0;">Job Description</h3>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid #fed7aa; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
            <p style="color: #374151; margin: 0; line-height: 1.7; font-size: 15px; text-align: justify;">
              ${job.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <!-- Job Order Details Section -->
        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border: 2px solid #d8b4fe; border-radius: 16px; padding: 28px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: #9333ea;">
            <div style="width: 32px; height: 32px; background: #e9d5ff; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 18px;">📋</span>
            </div>
            <h3 style="font-size: 20px; font-weight: 700; margin: 0;">Job Order Details</h3>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid #d8b4fe; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
            <p style="color: #374151; margin: 0; white-space: pre-wrap; line-height: 1.7; font-size: 15px; text-align: justify;">
              ${job.jobOrderDetails || 'No additional details provided.'}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 3px solid #e2e8f0; padding-top: 24px; text-align: center; color: #94a3b8; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); margin: -40px -40px 0 -40px; padding: 32px 40px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #1e40af;">JobFlow Management System</h4>
            <p style="margin: 0; font-size: 14px; color: #64748b;">Professional Job Order Management & Tracking</p>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
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
