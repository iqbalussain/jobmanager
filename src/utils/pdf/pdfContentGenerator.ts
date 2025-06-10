
import { Job } from '@/pages/Index';
import { getPriorityColor, getStatusColor } from './pdfStyles';

export const generatePDFContent = (job: Job, invoiceNumber?: string): string => {
  const priorityColors = getPriorityColor(job.priority);
  const statusColors = getStatusColor(job.status);

  return `
    <div style="max-width: 100%; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px;">
      <!-- Invoice Number at Top -->
      ${invoiceNumber ? `
      <div style="text-align: center; margin-bottom: 16px; padding: 12px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 8px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #0369a1;">Invoice #${invoiceNumber}</h2>
      </div>
      ` : ''}

      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 16px; border-radius: 10px; margin-bottom: 16px; color: white; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <div style="width: 24px; height: 24px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 12px; font-weight: bold;">✓</span>
              </div>
              <h1 style="font-size: 18px; font-weight: 700; margin: 0;">${job.jobOrderNumber}</h1>
            </div>
            <h2 style="font-size: 14px; margin: 0; opacity: 0.95; font-weight: 500; line-height: 1.3;">${job.title}</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end; min-width: 120px;">
            <div style="background: ${statusColors.bg}; color: ${statusColors.text}; padding: 4px 10px; border-radius: 16px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${statusColors.border}; text-align: center; width: 100%;">
              ${job.status.replace('-', ' ')}
            </div>
            <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; padding: 4px 10px; border-radius: 16px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${priorityColors.border}; text-align: center; width: 100%;">
              ${job.priority} PRIORITY
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        
        <!-- Customer & Team Section -->
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px; color: #1e40af;">
            <div style="width: 20px; height: 20px; background: #dbeafe; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 10px;">👥</span>
            </div>
            <h3 style="font-size: 12px; font-weight: 700; margin: 0;">Customer & Team</h3>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Customer:</label>
              <div style="background: white; padding: 6px 8px; border-radius: 5px; border: 1px solid #e2e8f0;">
                <p style="font-size: 10px; color: #1e293b; margin: 0; font-weight: 600;">${job.customer}</p>
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Assignee:</label>
              <div style="background: white; padding: 6px 8px; border-radius: 5px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0; font-size: 10px;">${job.assignee || 'Unassigned'}</p>
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Designer:</label>
              <div style="background: white; padding: 6px 8px; border-radius: 5px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0; font-size: 10px;">${job.designer || 'Not assigned'}</p>
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Salesman:</label>
              <div style="background: white; padding: 6px 8px; border-radius: 5px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0; font-size: 10px;">${job.salesman || 'Not assigned'}</p>
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Branch:</label>
              <div style="background: white; padding: 6px 8px; border-radius: 5px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0; font-size: 10px;">${job.branch || 'Head Office'}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline & Details Section -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px; color: #16a34a;">
            <div style="width: 20px; height: 20px; background: #dcfce7; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 10px;">📅</span>
            </div>
            <h3 style="font-size: 12px; font-weight: 700; margin: 0;">Timeline & Details</h3>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Created Date:</label>
              <div style="background: white; padding: 6px 8px; border-radius: 5px; border: 1px solid #bbf7d0;">
                <p style="color: #64748b; margin: 0; font-size: 10px;">${new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Due Date:</label>
              <div style="background: white; padding: 6px 8px; border-radius: 5px; border: 1px solid #bbf7d0;">
                <p style="color: #64748b; margin: 0; font-size: 10px;">${new Date(job.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Est. Hours:</label>
              <div style="background: white; padding: 6px 8px; border-radius: 5px; border: 1px solid #bbf7d0;">
                <p style="color: #64748b; margin: 0; font-size: 10px;">${job.estimatedHours} hours</p>
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Priority:</label>
              <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; border: 1px solid ${priorityColors.border}; padding: 5px 8px; border-radius: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                ${job.priority} PRIORITY
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; font-size: 9px; display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Status:</label>
              <div style="background: ${statusColors.bg}; color: ${statusColors.text}; border: 1px solid ${statusColors.border}; padding: 5px 8px; border-radius: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                ${job.status.replace('-', ' ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Job Order Details Section -->
      <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border: 1px solid #d8b4fe; border-radius: 10px; padding: 12px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 10px; color: #9333ea;">
          <div style="width: 20px; height: 20px; background: #e9d5ff; border-radius: 5px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 10px;">📋</span>
          </div>
          <h3 style="font-size: 12px; font-weight: 700; margin: 0;">Job Order Details</h3>
        </div>
        <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #d8b4fe; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);">
          <p style="color: #374151; margin: 0; white-space: pre-wrap; line-height: 1.4; font-size: 11px; text-align: justify;">
            ${job.jobOrderDetails || 'No additional details provided.'}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 12px; text-align: center; color: #94a3b8; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); margin: -20px -20px 0 -20px; padding: 16px;">
        <div style="max-width: 450px; margin: 0 auto;">
          <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #1e40af;">JobFlow Management System</h4>
          <p style="margin: 0; font-size: 10px; color: #64748b;">Professional Job Order Management & Tracking</p>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 9px; color: #94a3b8;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};
