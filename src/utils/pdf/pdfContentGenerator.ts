
import { Job } from '@/pages/Index';
import { getPriorityColor, getStatusColor } from './pdfStyles';

export const generatePDFContent = (job: Job, invoiceNumber?: string): string => {
  const priorityColors = getPriorityColor(job.priority);
  const statusColors = getStatusColor(job.status);

  return `
    <div style="max-width: 100%; font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.4; color: #1f2937; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; padding: 20px; box-sizing: border-box; background: #ffffff;">
      
      <!-- Invoice Number Header -->
      ${invoiceNumber ? `
      <div style="text-align: center; margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); border-radius: 12px; box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); border: 2px solid #3b82f6;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); letter-spacing: 1px;">INVOICE #${invoiceNumber}</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 600;">Official Invoice Document</p>
      </div>
      ` : ''}

      <!-- Job Order Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 30%, #60a5fa 70%, #93c5fd 100%); padding: 20px; border-radius: 16px; margin-bottom: 20px; color: white; box-shadow: 0 10px 30px rgba(30, 64, 175, 0.4); border: 2px solid #3b82f6; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); letter-spacing: 0.5px;">Job Order #${job.jobOrderNumber}</h1>
            <h2 style="font-size: 18px; margin: 0; opacity: 0.95; font-weight: 600; line-height: 1.3;">${job.title}</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
            <div style="background: ${statusColors.bg}; color: ${statusColors.text}; padding: 8px 16px; border-radius: 25px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${statusColors.border}; box-shadow: ${statusColors.shadow}; backdrop-filter: blur(10px);">
              ${job.status.replace('-', ' ')}
            </div>
            <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; padding: 8px 16px; border-radius: 25px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${priorityColors.border}; box-shadow: ${priorityColors.shadow}; backdrop-filter: blur(10px);">
              ${job.priority} PRIORITY
            </div>
          </div>
        </div>
      </div>

      <!-- Main Information Table -->
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); border: 2px solid #cbd5e1;">
          <thead>
            <tr style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white;">
              <th colspan="4" style="padding: 16px; font-size: 16px; font-weight: 800; text-align: center; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                📋 Job Order Information
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 2px solid #cbd5e1;">
              <td style="padding: 14px; font-weight: 700; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-right: 2px solid #cbd5e1; color: #1e40af; width: 25%;">Customer:</td>
              <td style="padding: 14px; font-weight: 600; border-right: 2px solid #cbd5e1; width: 25%;">${job.customer}</td>
              <td style="padding: 14px; font-weight: 700; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-right: 2px solid #cbd5e1; color: #1e40af; width: 25%;">Created Date:</td>
              <td style="padding: 14px; font-weight: 600; width: 25%;">${new Date(job.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr style="border-bottom: 2px solid #cbd5e1;">
              <td style="padding: 14px; font-weight: 700; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-right: 2px solid #cbd5e1; color: #1e40af;">Assignee:</td>
              <td style="padding: 14px; font-weight: 600; border-right: 2px solid #cbd5e1;">${job.assignee || 'Unassigned'}</td>
              <td style="padding: 14px; font-weight: 700; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-right: 2px solid #cbd5e1; color: #1e40af;">Due Date:</td>
              <td style="padding: 14px; font-weight: 600;">${new Date(job.dueDate).toLocaleDateString()}</td>
            </tr>
            <tr style="border-bottom: 2px solid #cbd5e1;">
              <td style="padding: 14px; font-weight: 700; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-right: 2px solid #cbd5e1; color: #1e40af;">Designer:</td>
              <td style="padding: 14px; font-weight: 600; border-right: 2px solid #cbd5e1;">${job.designer || 'Not assigned'}</td>
              <td style="padding: 14px; font-weight: 700; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-right: 2px solid #cbd5e1; color: #1e40af;">Est. Hours:</td>
              <td style="padding: 14px; font-weight: 600;">${job.estimatedHours} hours</td>
            </tr>
            <tr>
              <td style="padding: 14px; font-weight: 700; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-right: 2px solid #cbd5e1; color: #1e40af;">Salesman:</td>
              <td style="padding: 14px; font-weight: 600; border-right: 2px solid #cbd5e1;">${job.salesman || 'Not assigned'}</td>
              <td style="padding: 14px; font-weight: 700; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-right: 2px solid #cbd5e1; color: #1e40af;">Branch:</td>
              <td style="padding: 14px; font-weight: 600;">${job.branch || 'Head Office'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Job Order Details Section -->
      <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #cbd5e1; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 16px; color: white;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; text-align: center; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
              📋 Job Order Details
            </h3>
          </div>
          <div style="padding: 20px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
            <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 18px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
              <p style="color: #374151; margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 13px; text-align: justify; font-weight: 500;">
                ${job.jobOrderDetails || 'No additional details provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Summary Table -->
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); border: 2px solid #cbd5e1;">
          <thead>
            <tr style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;">
              <th style="padding: 16px; font-size: 16px; font-weight: 800; text-align: center; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                📊 Project Status Summary
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 20px; text-align: center;">
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                  <div style="background: ${statusColors.bg}; color: ${statusColors.text}; padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 3px solid ${statusColors.border}; box-shadow: ${statusColors.shadow}; min-width: 120px;">
                    STATUS: ${job.status.replace('-', ' ')}
                  </div>
                  <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 3px solid ${priorityColors.border}; box-shadow: ${priorityColors.shadow}; min-width: 120px;">
                    ${job.priority} PRIORITY
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="border-top: 3px solid #3b82f6; padding-top: 20px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); margin: 0 -20px -20px -20px; padding: 20px; border-radius: 0 0 16px 16px; box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);">
        <div style="max-width: 500px; margin: 0 auto;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
              <span style="font-size: 14px; color: white;">🏢</span>
            </div>
            <h4 style="margin: 0; font-size: 18px; font-weight: 800; color: #1e40af; letter-spacing: 0.5px;">JobFlow Management System</h4>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">Professional Job Order Management & Tracking</p>
          <div style="padding-top: 12px; border-top: 2px solid #cbd5e1;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};
