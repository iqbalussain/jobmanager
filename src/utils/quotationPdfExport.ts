import { generatePDFFromElement } from './pdf/pdfGenerator';
import { generateQuotationPDFContent } from './pdf/quotationPdfContentGenerator';
import { createStyledElement } from './pdf/pdfStyles';
import { Quotation, QuotationItem } from '@/hooks/useQuotations';

export const exportQuotationToPDF = async (
  quotation: Quotation, 
  items: QuotationItem[],
  selectedBranch: string = "Head Office"
): Promise<void> => {
  try {
    const content = generateQuotationPDFContent(quotation, items, selectedBranch);
    
    // Create a styled container for PDF rendering
    const container = createStyledElement();
    container.innerHTML = content;
    
    // Temporarily add to document for rendering
    document.body.appendChild(container);
    
    try {
      const fileName = `Quotation_${quotation.quotation_number}_${new Date().toISOString().split('T')[0]}.pdf`;
      await generatePDFFromElement(container, fileName);
    } finally {
      // Clean up - remove the temporary element
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Error exporting quotation to PDF:', error);
    throw new Error('Failed to export quotation to PDF');
  }
};