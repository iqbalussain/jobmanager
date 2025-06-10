
import { Job } from '@/pages/Index';
import { getPriorityColor, getStatusColor } from './pdfStyles';

export const generatePDFContent = (job: Job, invoiceNumber?: string): string => {
  const priorityColors = getPriorityColor(job.priority);
  const statusColors = getStatusColor(job.status);

  return `
    <div style="max-width: 100%; font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.6; color: #1f2937; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
      <!-- Invoice Number at Top -->
      ${invoiceNumber ? `
      <div style="text-align: center; margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); border-radius: 16px; box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); border: 2px solid #3b82f6;">
        <h2 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); letter-spacing: 1px;">INVOICE #${invoiceNumber}</h2>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Official Invoice Document</p>
      </div>
      ` : ''}

      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 30%, #60a5fa 70%, #93c5fd 100%); padding: 24px; border-radius: 20px; margin-bottom: 24px; color: white; box-shadow: 0 12px 30px rgba(30, 64, 175, 0.4); border: 2px solid #3b82f6; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -50%; right: -10%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="position: relative; z-index: 2;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3);">
                  <span style="font-size: 18px; font-weight: bold;">📋</span>
                </div>
                <h1 style="font-size: 24px; font-weight: 800; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); letter-spacing: 0.5px;">${job.jobOrderNumber}</h1>
              </div>
              <h2 style="font-size: 18px; margin: 0; opacity: 0.95; font-weight: 600; line-height: 1.4; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">${job.title}</h2>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; align-items: flex-end; min-width: 180px;">
              <div style="background: ${statusColors.bg}; color: ${statusColors.text}; padding: 8px 16px; border-radius: 25px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${statusColors.border}; text-align: center; width: 100%; box-shadow: ${statusColors.shadow}; backdrop-filter: blur(10px);">
                ${job.status.replace('-', ' ')}
              </div>
              <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; padding: 8px 16px; border-radius: 25px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 2px solid ${priorityColors.border}; text-align: center; width: 100%; box-shadow: ${priorityColors.shadow}; backdrop-filter: blur(10px);">
                ${job.priority} PRIORITY
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        
        <!-- Customer & Team Section -->
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%); border: 2px solid #cbd5e1; border-radius: 20px; padding: 20px; box-shadow: 0 8px 25px rgba(203, 213, 225, 0.3); position: relative; overflow: hidden;">
          <div style="position: absolute; top: -30px; left: -30px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(30, 64, 175, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #1e40af;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid #3b82f6;">
                <span style="font-size: 14px;">👥</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">Customer & Team</h3>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Customer:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <p style="font-size: 14px; color: #1e293b; margin: 0; font-weight: 700;">${job.customer}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Assignee:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">${job.assignee || 'Unassigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Designer:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">${job.designer || 'Not assigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Salesman:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">${job.salesman || 'Not assigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Branch:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">${job.branch || 'Head Office'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline & Details Section -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%); border: 2px solid #bbf7d0; border-radius: 20px; padding: 20px; box-shadow: 0 8px 25px rgba(187, 247, 208, 0.3); position: relative; overflow: hidden;">
          <div style="position: absolute; top: -30px; right: -30px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(22, 163, 74, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #16a34a;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid #22c55e;">
                <span style="font-size: 14px;">📅</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">Timeline & Details</h3>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Created Date:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #bbf7d0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">${new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Due Date:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #bbf7d0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">${new Date(job.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Est. Hours:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%); padding: 12px 16px; border-radius: 12px; border: 2px solid #bbf7d0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 14px; font-weight: 600;">${job.estimatedHours} hours</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Priority:</label>
                <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; border: 2px solid ${priorityColors.border}; padding: 10px 16px; border-radius: 15px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: center; box-shadow: ${priorityColors.shadow};">
                  ${job.priority} PRIORITY
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 11px; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Status:</label>
                <div style="background: ${statusColors.bg}; color: ${statusColors.text}; border: 2px solid ${statusColors.border}; padding: 10px 16px; border-radius: 15px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: center; box-shadow: ${statusColors.shadow};">
                  ${job.status.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Job Order Details Section -->
      <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%); border: 2px solid #d8b4fe; border-radius: 20px; padding: 24px; margin-bottom: 32px; box-shadow: 0 8px 25px rgba(216, 180, 254, 0.3); position: relative; overflow: hidden;">
        <div style="position: absolute; bottom: -40px; right: -40px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="position: relative; z-index: 2;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: #9333ea;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid #a855f7;">
              <span style="font-size: 16px;">📋</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">Job Order Details</h3>
          </div>
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 16px; border: 2px solid #d8b4fe; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
            <p style="color: #374151; margin: 0; white-space: pre-wrap; line-height: 1.7; font-size: 15px; text-align: justify; font-weight: 500;">
              ${job.jobOrderDetails || 'No additional details provided.'}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 3px solid #3b82f6; padding-top: 20px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); margin: 0 -30px -30px -30px; padding: 24px 30px; border-radius: 0 0 20px 20px;">
        <div style="max-width: 500px; margin: 0 auto;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 14px; color: white;">🏢</span>
            </div>
            <h4 style="margin: 0; font-size: 16px; font-weight: 800; color: #1e40af; letter-spacing: 0.5px;">JobFlow Management System</h4>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; font-weight: 600;">Professional Job Order Management & Tracking</p>
          <div style="padding-top: 12px; border-top: 2px solid #cbd5e1;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 500;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};
