import { Quotation, QuotationItem } from '@/hooks/useQuotations';
import { getBranchConfig } from '@/utils/branchConfig';

export const generateQuotationPDFContent = (
  quotation: Quotation, 
  items: QuotationItem[], 
  selectedBranch: string = "Head Office"
): string => {
  const branchConfig = getBranchConfig(selectedBranch);
  const currentDate = new Date().toLocaleDateString();

  return `
    <div style="
      font-family: 'Arial', sans-serif; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 40px; 
      background: white; 
      color: #1f2937;
      line-height: 1.6;
    ">
      <!-- Header with Company Details -->
      <div style="
        border-bottom: 3px solid #2563eb; 
        padding-bottom: 20px; 
        margin-bottom: 30px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="
              color: #2563eb; 
              font-size: 28px; 
              font-weight: bold; 
              margin: 0 0 10px 0;
            ">${branchConfig?.name || selectedBranch}</h1>
            ${branchConfig?.address.map(line => `<p style="margin: 2px 0; color: #6b7280;">${line}</p>`).join('') || ''}
            <p style="margin: 2px 0; color: #6b7280;">Phone: ${branchConfig?.phone || 'N/A'}</p>
            <p style="margin: 2px 0; color: #6b7280;">Email: ${branchConfig?.email || 'N/A'}</p>
            ${branchConfig?.website ? `<p style="margin: 2px 0; color: #6b7280;">Website: ${branchConfig.website}</p>` : ''}
          </div>
          <div style="text-align: right;">
            <h2 style="
              color: #2563eb; 
              font-size: 24px; 
              font-weight: bold; 
              margin: 0 0 10px 0;
            ">QUOTATION</h2>
            <p style="margin: 5px 0; color: #374151;"><strong>Quotation #:</strong> ${quotation.quotation_number}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Date:</strong> ${currentDate}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> 
              <span style="
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 12px; 
                background: ${getStatusColor(quotation.status).background}; 
                color: ${getStatusColor(quotation.status).text};
              ">${quotation.status.toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Customer Information</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${quotation.customer_name || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Salesman:</strong> ${quotation.salesman_name || 'N/A'}</p>
          </div>
          <div>
            <p style="margin: 5px 0;"><strong>Created:</strong> ${new Date(quotation.created_at).toLocaleDateString()}</p>
            ${quotation.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${quotation.notes}</p>` : ''}
          </div>
        </div>
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
            ${items.map((item, index) => `
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
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Terms & Conditions:</h3>
        <ul style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>This quotation is valid for 30 days from the date of issue.</li>
          <li>Prices are subject to change without prior notice.</li>
          <li>Payment terms: 50% advance, 50% on completion.</li>
          <li>Delivery time will be confirmed upon order confirmation.</li>
          <li>All disputes subject to local jurisdiction.</li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="
        margin-top: 40px; 
        padding-top: 20px; 
        border-top: 1px solid #e5e7eb; 
        text-align: center; 
        color: #6b7280; 
        font-size: 14px;
      ">
        <p style="margin: 5px 0;">Thank you for your business!</p>
        <p style="margin: 5px 0;">For any queries, please contact us at ${branchConfig?.phone || 'N/A'} or ${branchConfig?.email || 'N/A'}</p>
      </div>
    </div>
  `;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return { background: '#f3f4f6', text: '#374151' };
    case 'sent':
      return { background: '#fef3c7', text: '#92400e' };
    case 'accepted':
      return { background: '#d1fae5', text: '#065f46' };
    case 'rejected':
      return { background: '#fee2e2', text: '#991b1b' };
    case 'converted':
      return { background: '#dbeafe', text: '#1e40af' };
    default:
      return { background: '#f3f4f6', text: '#374151' };
  }
};