
import { Job } from '@/types/jobOrder';
import { getPriorityColor, getStatusColor } from './pdfStyles';
import { supabase } from '@/integrations/supabase/client';

export const generatePDFContent = async (job: Job, invoiceNumber?: string): Promise<string> => {
  // Fetch job order items
  const { data: itemsData } = await supabase
    .from('job_order_items')
    .select('*')
    .eq('job_order_id', job.id)
    .order('order_sequence');

  // Fetch job titles separately for display
  let items = itemsData || [];
  if (items.length > 0) {
    const jobTitleIds = [...new Set(items.map(item => item.job_title_id))];
    const { data: jobTitles } = await supabase
      .from('job_titles')
      .select('id, job_title_id')
      .in('id', jobTitleIds);

    items = items.map(item => ({
      ...item,
      job_title_name: jobTitles?.find(jt => jt.id === item.job_title_id)?.job_title_id || 'N/A'
    }));
  }

  const hasItems = items && items.length > 0;
  const priorityColors = getPriorityColor(job.priority);
  const statusColors = getStatusColor(job.status);

  return `
    <div style="max-width: 210mm; margin: 0 auto; font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; background: #ffffff; padding: 0; box-sizing: border-box;">
      
      <!-- Company Letterhead -->
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 40px; margin: 0; border-bottom: 4px solid #1e40af;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 28pt; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Job Order</h1>
            <p style="margin: 8px 0 0 0; font-size: 11pt; color: rgba(255, 255, 255, 0.9);">Professional Work Order Document</p>
          </div>
          <div style="text-align: right;">
            <div style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); padding: 12px 20px; border-radius: 8px; border: 2px solid rgba(255, 255, 255, 0.3);">
              <p style="margin: 0; font-size: 9pt; color: rgba(255, 255, 255, 0.9); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
              <p style="margin: 4px 0 0 0; font-size: 18pt; font-weight: 800; color: #ffffff;">${job.jobOrderNumber}</p>
            </div>
          </div>
        </div>
      </div>

      ${invoiceNumber ? `
      <!-- Invoice Badge -->
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 16px 40px; margin: 0; border-bottom: 3px solid #047857;">
        <div style="text-align: center;">
          <span style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 8px 24px; border-radius: 20px; border: 2px solid rgba(255, 255, 255, 0.3);">
            <span style="font-size: 10pt; color: rgba(255, 255, 255, 0.9); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Invoice Number: </span>
            <span style="font-size: 14pt; font-weight: 800; color: #ffffff;">${invoiceNumber}</span>
          </span>
        </div>
      </div>
      ` : ''}

      <!-- Document Info Bar -->
      <div style="padding: 24px 40px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; margin: 0;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div>
            <p style="margin: 0; font-size: 9pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Status</p>
            <div style="margin-top: 6px; display: inline-block; background: ${statusColors.bg}; color: ${statusColors.text}; padding: 6px 14px; border-radius: 16px; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid ${statusColors.border};">
              ${job.status.replace('-', ' ')}
            </div>
          </div>
          <div>
            <p style="margin: 0; font-size: 9pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Priority</p>
            <div style="margin-top: 6px; display: inline-block; background: ${priorityColors.bg}; color: ${priorityColors.text}; padding: 6px 14px; border-radius: 16px; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid ${priorityColors.border};">
              ${job.priority}
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 9pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Date Issued</p>
            <p style="margin: 6px 0 0 0; font-size: 11pt; font-weight: 700; color: #1e293b;">${new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div style="padding: 32px 40px;">
        
        <!-- Job Title Section -->
        <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px 0; font-size: 20pt; font-weight: 700; color: #1e293b; line-height: 1.3;">${job.title}</h2>
          <p style="margin: 0; font-size: 10pt; color: #64748b;">Project Overview</p>
        </div>

        <!-- Two Column Layout -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
          
          <!-- Left Column: Customer & Contact -->
          <div>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
              <h3 style="margin: 0 0 16px 0; font-size: 11pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Information</h3>
              <div style="space-y: 10px;">
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Name</p>
                  <p style="margin: 0; font-size: 11pt; font-weight: 700; color: #1e293b;">${job.customer}</p>
                </div>
                ${job.clientName ? `
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Client Contact</p>
                  <p style="margin: 0; font-size: 10pt; color: #475569;">${job.clientName}</p>
                </div>
                ` : ''}
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Branch</p>
                  <p style="margin: 0; font-size: 10pt; color: #475569;">${job.branch || 'Head Office'}</p>
                </div>
                ${job.deliveredAt ? `
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Location</p>
                  <p style="margin: 0; font-size: 10pt; color: #475569;">${job.deliveredAt}</p>
                </div>
                ` : ''}
              </div>
            </div>

            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
              <h3 style="margin: 0 0 16px 0; font-size: 11pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Team Assignment</h3>
              <div style="space-y: 10px;">
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Assignee</p>
                  <p style="margin: 0; font-size: 10pt; color: #475569;">${job.assignee || 'Not assigned'}</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Designer</p>
                  <p style="margin: 0; font-size: 10pt; color: #475569;">${job.designer || 'Not assigned'}</p>
                </div>
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Salesman</p>
                  <p style="margin: 0; font-size: 10pt; color: #475569;">${job.salesman || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Timeline & Details -->
          <div>
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
              <h3 style="margin: 0 0 16px 0; font-size: 11pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Timeline</h3>
              <div style="space-y: 10px;">
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Created Date</p>
                  <p style="margin: 0; font-size: 10pt; color: #78350f; font-weight: 600;">${new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</p>
                  <p style="margin: 0; font-size: 10pt; color: #78350f; font-weight: 600;">${new Date(job.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Hours</p>
                  <p style="margin: 0; font-size: 10pt; color: #78350f; font-weight: 600;">${job.estimatedHours} hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        ${hasItems ? `
        <!-- Job Order Items Section -->
        <div style="margin-bottom: 32px;">
          <h3 style="margin: 0 0 16px 0; font-size: 13pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;">📦 Job Order Items</h3>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);">
                  <th style="padding: 14px 16px; text-align: left; font-size: 9pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1;">#</th>
                  <th style="padding: 14px 16px; text-align: left; font-size: 9pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1;">Item Name</th>
                  <th style="padding: 14px 16px; text-align: left; font-size: 9pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1;">Description</th>
                  <th style="padding: 14px 16px; text-align: center; font-size: 9pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, index) => `
                  <tr style="border-bottom: 1px solid #f1f5f9; ${index % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;'}">
                    <td style="padding: 14px 16px; font-size: 10pt; color: #64748b; font-weight: 600;">${index + 1}</td>
                    <td style="padding: 14px 16px; font-size: 10pt; color: #1e293b; font-weight: 700;">${(item as any).job_title_name}</td>
                    <td style="padding: 14px 16px; font-size: 10pt; color: #475569; line-height: 1.5;">${item.description || 'No description'}</td>
                    <td style="padding: 14px 16px; text-align: center;">
                      <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 10pt; font-weight: 700; border: 1px solid #93c5fd;">${item.quantity}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        <!-- Job Order Details Section -->
        ${job.jobOrderDetails ? `
        <div style="background: #f1f5f9; padding: 24px; border-radius: 8px; border-left: 4px solid #6366f1; margin-bottom: 32px;">
          <h3 style="margin: 0 0 16px 0; font-size: 11pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Additional Details</h3>
          <p style="margin: 0; font-size: 10pt; color: #475569; line-height: 1.8; white-space: pre-wrap; text-align: justify;">
            ${job.jobOrderDetails}
          </p>
        </div>
        ` : ''}

      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 24px 40px; margin: 0; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 9pt; color: #64748b; font-weight: 600;">Professional Job Order Management System</p>
        <p style="margin: 0; font-size: 8pt; color: #94a3b8;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  `;
};
