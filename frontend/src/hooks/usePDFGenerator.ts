import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface PDFGeneratorOptions {
  fileName: string;
  elementId: string;
}

export const usePDFGenerator = ({ fileName, elementId }: PDFGeneratorOptions) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async () => {
    const input = document.getElementById(elementId);
    if (!input) {
      setError('Could not find the element to export.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`${fileName}.pdf`);

    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError('An error occurred while generating the PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, error, generatePDF };
};