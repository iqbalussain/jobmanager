import { Quotation, QuotationItem } from '@/hooks/useQuotations';
import { getBranchConfig } from '@/utils/branchConfig';
import { supabase } from '@/integrations/supabase/client';

export const generateQuotationPDFContent = (
  quotation: Quotation, 
  items: QuotationItem[],
  selectedBranch: string = "Head Office"
): string => {
  const branchConfig = getBranchConfig(selectedBranch);
  const statusColor = getStatusColor(quotation.status);
  
  // Generate logo URL
  const logoUrl = supabase.storage
    .from('branch-logos')
    .getPublicUrl(`${selectedBranch.toLowerCase().replace(/\s+/g, '-')}-logo.png`).data.publicUrl;

  const itemsTableRows = items.map((item, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: center; font-weight: 500;">${index + 1}</td>
      <td style="padding: 12px 8px; font-weight: 500;">${item.job_title?.job_title_id || 'N/A'}</td>
      <td style="padding: 12px 8px; color: #6b7280; line-height: 1.4;">${item.description}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right;">$${item.unit_price?.toFixed(2) || '0.00'}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600;">$${item.total_price?.toFixed(2) || '0.00'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quotation ${quotation.quotation_number}</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 20px; color: #374151; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; background: white; }
        .header { margin-bottom: 40px; }
        .company-info { margin-bottom: 20px; }
        .quotation-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #f1f5f9; padding: 12px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
        .total-row { background: #f8fafc; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Company Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #2563eb;">
          <div style="flex: 1;">
            <div style="margin-bottom: 16px;">
              <img src="${logoUrl}" alt="${branchConfig?.name} Logo" style="max-height: 80px; max-width: 200px; object-fit: contain;" onerror="this.style.display='none'" />
            </div>
            <h1 style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px;">
              ${branchConfig?.name || 'Company Name'}
            </h1>
            <div style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              ${branchConfig?.address.map(line => `<div>${line}</div>`).join('') || '<div>Company Address</div>'}
              <div style="margin-top: 8px;">
                <strong>Phone:</strong> ${branchConfig?.phone || 'N/A'} | 
                <strong>Email:</strong> ${branchConfig?.email || 'N/A'}
                ${branchConfig?.website ? ` | <strong>Web:</strong> ${branchConfig.website}` : ''}
              </div>
            </div>
          </div>
          
          <div style="text-align: right;">
            <h2 style="font-size: 28px; color: #1e40af; margin: 0 0 16px 0; font-weight: bold;">QUOTATION</h2>
            <div style="background: ${statusColor.backgroundColor}; color: ${statusColor.textColor}; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px;">
              ${quotation.status}
            </div>
            <div style="font-size: 14px; color: #374151;">
              <div><strong>Quotation #:</strong> ${quotation.quotation_number}</div>
              <div><strong>Date:</strong> ${new Date(quotation.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="quotation-details">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;">Customer Details</h3>
              <div style="font-size: 16px;"><strong>${quotation.customer_name || 'N/A'}</strong></div>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;">Salesman</h3>
              <div style="font-size: 16px;"><strong>${quotation.salesman_name || 'N/A'}</strong></div>
            </div>
          </div>
          ${quotation.notes ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h4 style="margin: 0 0 8px 0; color: #374151;">Notes:</h4>
              <p style="margin: 0; color: #6b7280; font-style: italic;">${quotation.notes}</p>
            </div>
          ` : ''}
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">#</th>
              <th style="width: 150px;">Job Title</th>
              <th>Description</th>
              <th style="width: 80px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Unit Price</th>
              <th style="width: 120px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
            <tr class="total-row">
              <td colspan="5" style="padding: 16px 8px; text-align: right; font-size: 18px; font-weight: bold;">
                Grand Total:
              </td>
              <td style="padding: 16px 8px; text-align: right; font-size: 18px; font-weight: bold; color: #059669;">
                $${quotation.total_amount?.toFixed(2) || '0.00'}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Terms and Conditions -->
        <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <h3 style="margin: 0 0 16px 0; color: #1f2937;">Terms & Conditions</h3>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
            <li style="margin-bottom: 8px;">This quotation is valid for 30 days from the date of issue.</li>
            <li style="margin-bottom: 8px;">Payment terms: 50% advance, 50% on completion.</li>
            <li style="margin-bottom: 8px;">Prices are subject to change without prior notice.</li>
            <li style="margin-bottom: 8px;">Delivery timeline will be confirmed upon order confirmation.</li>
          </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div style="text-align: center; color: #9ca3af;">
            <p>Thank you for your business! For any questions, please contact us at ${branchConfig?.email || 'info@company.com'}</p>
            <p style="margin: 8px 0 0 0; font-size: 11px;">This is a computer-generated quotation and does not require a signature.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return { backgroundColor: '#f3f4f6', textColor: '#374151' };
    case 'sent':
      return { backgroundColor: '#dbeafe', textColor: '#1e40af' };
    case 'accepted':
      return { backgroundColor: '#d1fae5', textColor: '#065f46' };
    case 'rejected':
      return { backgroundColor: '#fee2e2', textColor: '#991b1b' };
    case 'converted':
      return { backgroundColor: '#e9d5ff', textColor: '#7c2d12' };
    default:
      return { backgroundColor: '#f3f4f6', textColor: '#374151' };
  }
}