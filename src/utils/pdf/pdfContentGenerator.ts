
import { Job } from '@/pages/Index';
import { getPriorityColor, getStatusColor } from './pdfStyles';
import { supabase } from '@/integrations/supabase/client';

export const generatePDFContent = async (job: Job, invoiceNumber?: string): Promise<string> => {
  // Fetch job order items - use type assertion since table may not be in types
  let items: any[] = [];
  try {
    const { data: itemsData } = await (supabase as any)
      .from('job_order_items')
      .select('*')
      .eq('job_order_id', job.id)
      .order('order_sequence');
    
    items = itemsData || [];
    
    // Fetch job titles separately for display
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
  } catch (e) {
    console.log('Job order items not available:', e);
  }

  const hasItems = items && items.length > 0;
  const priorityColors = getPriorityColor(job.priority);
  const statusColors = getStatusColor(job.status);

  return `
    <div style="max-width: 100%; font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 13px; line-height: 1.5; color: #1f2937; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; padding: 20px; box-sizing: border-box;">
      <!-- Invoice Number at Top -->
      ${invoiceNumber ? `
      <div style="text-align: center; margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); border-radius: 12px; box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25); border: 2px solid #3b82f6;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); letter-spacing: 0.5px;">INVOICE #${invoiceNumber}</h2>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Official Invoice Document</p>
      </div>
      ` : ''}

      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 30%, #60a5fa 70%, #93c5fd 100%); padding: 18px; border-radius: 16px; margin-bottom: 16px; color: white; box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3); border: 2px solid #3b82f6; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -30%; right: -5%; width: 120px; height: 120px; background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="position: relative; z-index: 2;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255, 255, 255, 0.3);">
                  <span style="font-size: 14px; font-weight: bold;">📋</span>
                </div>
                <h1 style="font-size: 20px; font-weight: 800; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); letter-spacing: 0.3px;">${job.jobOrderNumber}</h1>
              </div>
              <h2 style="font-size: 16px; margin: 0; opacity: 0.95; font-weight: 600; line-height: 1.3; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">${job.title}</h2>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end; min-width: 140px;">
              <div style="background: ${statusColors.bg}; color: ${statusColors.text}; padding: 6px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; border: 2px solid ${statusColors.border}; text-align: center; width: 100%; box-shadow: ${statusColors.shadow}; backdrop-filter: blur(10px);">
                ${job.status.replace('-', ' ')}
              </div>
              <div style="background: ${priorityColors.bg}; color: ${priorityColors.text}; padding: 6px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; border: 2px solid ${priorityColors.border}; text-align: center; width: 100%; box-shadow: ${priorityColors.shadow}; backdrop-filter: blur(10px);">
                ${job.priority} PRIORITY
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        
        <!-- Customer & Team Section -->
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%); border: 2px solid #bfdbfe; border-radius: 16px; padding: 16px; box-shadow: 0 6px 20px rgba(191, 219, 254, 0.3); position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; left: -20px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(30, 64, 175, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #1e40af;">
              <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #3b82f6;">
                <span style="font-size: 12px;">👥</span>
              </div>
              <h3 style="font-size: 14px; font-weight: 800; margin: 0; letter-spacing: 0.3px;">Customer & Team</h3>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Customer:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="font-size: 12px; color: #1e293b; margin: 0; font-weight: 700;">${job.customer}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Assignee:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 11px; font-weight: 600;">${job.assignee || 'Unassigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Designer:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 11px; font-weight: 600;">${job.designer || 'Not assigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Salesman:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 11px; font-weight: 600;">${job.salesman || 'Not assigned'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Branch:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 11px; font-weight: 600;">${job.branch || 'Head Office'}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Delivered At:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 11px; font-weight: 600;">${job.deliveredAt || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline & Details Section -->
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%); border: 2px solid #bfdbfe; border-radius: 16px; padding: 16px; box-shadow: 0 6px 20px rgba(191, 219, 254, 0.3); position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(30, 64, 175, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
          <div style="position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #1e40af;">
              <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #3b82f6;">
                <span style="font-size: 12px;">📅</span>
              </div>
              <h3 style="font-size: 14px; font-weight: 800; margin: 0; letter-spacing: 0.3px;">Timeline & Details</h3>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Created Date:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #bfdbfe; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 11px; font-weight: 600;">${new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Due Date:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #bfdbfe; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 11px; font-weight: 600;">${new Date(job.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #475569; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px;">Est. Hours:</label>
                <div style="background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%); padding: 8px 12px; border-radius: 8px; border: 2px solid #bfdbfe; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
                  <p style="color: #64748b; margin: 0; font-size: 11px; font-weight: 600;">${job.estimatedHours} hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${hasItems ? `
      <!-- Job Order Items Section -->
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%); border: 2px solid #bfdbfe; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 6px 20px rgba(191, 219, 254, 0.3); position: relative;">
        <div style="position: relative; z-index: 2;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #1e40af;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 2px solid #3b82f6;">
              <span style="font-size: 12px;">📦</span>
            </div>
            <h3 style="font-size: 14px; font-weight: 800; margin: 0; letter-spacing: 0.3px;">Job Order Items</h3>
          </div>
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 12px; border: 2px solid #bfdbfe; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);">
                  <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">#</th>
                  <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">Item Name</th>
                  <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">Description</th>
                  <th style="padding: 10px 12px; text-align: center; font-size: 10px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #3b82f6;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, index) => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 12px; font-size: 11px; color: #64748b; font-weight: 600;">${index + 1}</td>
                    <td style="padding: 10px 12px; font-size: 11px; color: #1e293b; font-weight: 700;">${(item as any).job_title_name}</td>
                    <td style="padding: 10px 12px; font-size: 11px; color: #475569; font-weight: 500; line-height: 1.4;">${item.description || 'No description'}</td>
                    <td style="padding: 10px 12px; text-align: center; font-size: 11px; color: #1e293b; font-weight: 700;">
                      <span style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 4px 10px; border-radius: 6px; border: 1px solid #3b82f6;">${item.quantity}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Job Order Details Section -->
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%); border: 2px solid #bfdbfe; border-radius: 16px; padding: 16px; margin-bottom: 20px; box-shadow: 0 6px 20px rgba(191, 219, 254, 0.3); position: relative;">
        <div style="position: absolute; bottom: -30px; right: -30px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(30, 64, 175, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="position: relative; z-index: 2;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #1e40af;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 2px solid #3b82f6;">
              <span style="font-size: 12px;">📋</span>
            </div>
            <h3 style="font-size: 14px; font-weight: 800; margin: 0; letter-spacing: 0.3px;">Job Order Details</h3>
          </div>
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 14px; border-radius: 12px; border: 2px solid #bfdbfe; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);">
            <p style="color: #374151; margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 12px; text-align: justify; font-weight: 500;">
              ${job.jobOrderDetails || 'No additional details provided.'}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 2px solid #cbd5e1;">
        <div style="margin-bottom: 8px;">
          <p style="margin: 0 0 8px 0; font-size: 10px; color: #64748b; font-weight: 600;">Professional Job Order Management & Tracking</p>
          <div style="padding-top: 8px; border-top: 2px solid #cbd5e1;">
            <p style="margin: 0; font-size: 9px; color: #94a3b8; font-weight: 500;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};
