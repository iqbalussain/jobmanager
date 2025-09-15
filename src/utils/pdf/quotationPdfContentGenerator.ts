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
  const currentDate = new Date().toLocaleDateString();
  
  // Generate logo URL
  const logoUrl = supabase.storage
    .from('branch-logos')
    .getPublicUrl(`${selectedBranch.toLowerCase().replace(/\s+/g, '-')}-logo.png`).data.publicUrl;

  const itemsTableRows = items.map((item, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: center; font-weight: 500;">${index + 1}</td>
      <td style="padding: 12px 8px; font-weight: 500;">${item.job_title || 'N/A'}</td>
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
            <div style="
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 40px; 
              padding-bottom: 20px; 
              border-bottom: 3px solid #2563eb;
              gap: 20px;
            ">
              <!-- Left: Logo + Address -->
              <div style="flex: 1; max-width: 55%;">
                <div style="margin-bottom: 12px;">
                  <img 
                    src="${logoUrl}" 
                    alt="${branchConfig?.name} Logo" 
                    style="max-height: 100px; max-width: 100%; object-fit: contain;" 
                    onerror="this.style.display='none'" 
                  />
                </div>
              </div>

              <!-- Right: Quotation Info -->
              <div style="flex: 0 0 40%; text-align: right; word-wrap: break-word;">
                <h2 style="
                  color: #2563eb; 
                  font-size: 24px; 
                  font-weight: bold; 
                  margin: 0 0 12px 0;
                ">
                  QUOTATION
                </h2>

                <p style="margin: 5px 0; color: #374151;">
                  <strong>Quotation #:</strong> ${quotation.quotation_number}
                </p>

                <p style="margin: 5px 0; color: #374151;">
                  <strong>Date:</strong> ${currentDate}
                </p>

                <p style="margin: 5px 0; color: #374151;">
                  <strong>Salesman:</strong> ${quotation.salesman_name || 'N/A'}
                </p>

                <p style="margin: 5px 0; color: #374151;">
                  <strong>Status:</strong> 
                  <span style="
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-size: 12px; 
                    background: ${statusColor.backgroundColor}; 
                    color: ${statusColor.textColor};
                  ">
                    ${quotation.status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
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
              <div style="margin-bottom: 30px;">
                <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Quotation Items</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
                  <thead>
                    <tr style="background: #f9fafb;">
                      <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; color: #374151; font-weight: 600;">#</th>
                      <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; color: #374151; font-weight: 600;">Item Description</th>
                      <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: center; color: #374151; font-weight: 600;">Qty</th>
                      <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #374151; font-weight: 600;">Unit Price</th>
                      <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #374151; font-weight: 600;">Total</th>
                    </tr>
                  </thead>
                  <tbody>

        <${items.map((item, index) => `
                      <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="border: 1px solid #e5e7eb; padding: 12px; color: #6b7280;">${index + 1}</td>
                        <td style="border: 1px solid #e5e7eb; padding: 12px; color: #374151;">
                          <div style="font-weight: 500;">${item.job_title || 'N/A'}</div>
                          <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${item.description}</div>
                        </td>
                        <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: center; color: #374151;">${item.quantity}</td>
                        <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #374151;">OMR ${parseFloat(item.unit_price.toString()).toFixed(2)}</td>
                        <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #374151; font-weight: 500;">OMR ${parseFloat(item.total_price.toString()).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                    <tr style="background: #f9fafb; font-weight: 600;">
                      <td colspan="4" style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #374151;">Grand Total:</td>
                      <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #2563eb; font-size: 18px;">OMR ${parseFloat(quotation.total_amount?.toString() || '0').toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

        <!-- Terms and Conditions -->
        <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <h3 style="margin: 0 0 16px 0; color: #1f2937;">Terms & Conditions</h3>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
            <li style="margin-bottom: 8px;">This quotation is valid for 30 days from the date of issue.</li>
            <li style="margin-bottom: 8px;">Payment terms: 50% advance, 50% on completion.</li>
            <li style="margin-bottom: 8px;">Prices are subject to change without prior notice. The Price is exclusive of VAT, Which will be added 5% in invoice</li>
          </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div style="text-align: center; color: #9ca3af;">
            <p>Thank you for your business! For any questions, please contact us at ${branchConfig?.email || 'printwaves@printwavesoman.com'}</p>
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