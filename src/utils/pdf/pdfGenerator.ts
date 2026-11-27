
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFFromElement = async (element: HTMLElement, fileName: string): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // Increased scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    const pages = pdf.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(7);
      pdf.setTextColor(140);
      const prefix = 'Design & Developed by ';
      const x = 105 - pdf.getTextWidth(prefix + 'Seyed Ussain') / 2;
      pdf.text(prefix, x, 292);
      pdf.setTextColor(109, 40, 217);
      pdf.textWithLink('Seyed Ussain', x + pdf.getTextWidth(prefix), 292, { url: 'https://amitynode.com' });
    }
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
