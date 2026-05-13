import React, { useState } from 'react';
import { Download, FileText, Receipt, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/utils';

interface PDFExportProps {
  data: any;
  type: 'receipt' | 'invoice' | 'prescription' | 'inventory';
  elementId?: string;
  className?: string;
}

// React component version for UI usage
export function PDFExportComponent({ data, type, elementId, className }: PDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdfExport = new PDFExportUtility(data, type);
      await pdfExport.generatePDF();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isExporting}
      className={cn(
        'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        'bg-emerald-600 text-white hover:bg-emerald-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isExporting ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </>
      )}
    </button>
  );
}

// Utility class version for programmatic usage
export class PDFExportUtility {
  private data: any;
  private type: 'receipt' | 'invoice' | 'prescription' | 'inventory';

  constructor(data: any, type: 'receipt' | 'invoice' | 'prescription' | 'inventory') {
    this.data = data;
    this.type = type;
  }

  private generateFileName(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    switch (this.type) {
      case 'receipt':
        return `receipt_${this.data.id}_${timestamp}.pdf`;
      case 'invoice':
        return `invoice_${this.data.invoiceNumber}_${timestamp}.pdf`;
      case 'prescription':
        return `prescription_${this.data.prescriptionNumber}_${timestamp}.pdf`;
      case 'inventory':
        return `inventory_report_${timestamp}.pdf`;
      default:
        return `export_${timestamp}.pdf`;
    }
  }


  async generatePDF(): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      let yPosition = margin;

      // Add header based on type
      pdf.setFontSize(20);
      pdf.setTextColor(16, 185, 129); // Emerald color
      switch (this.type) {
        case 'receipt':
          pdf.text('Pharmacy Receipt', pageWidth / 2, yPosition, { align: 'center' });
          break;
        case 'invoice':
          pdf.setTextColor(59, 130, 246); // Blue color
          pdf.text('Invoice', pageWidth / 2, yPosition, { align: 'center' });
          break;
        case 'prescription':
          pdf.setTextColor(16, 185, 129); // Emerald color
          pdf.text('Medical Prescription', pageWidth / 2, yPosition, { align: 'center' });
          break;
        case 'inventory':
          pdf.setTextColor(139, 92, 246); // Purple color
          pdf.text('Inventory Report', pageWidth / 2, yPosition, { align: 'center' });
          break;
      }
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setTextColor(0, 0, 0);

      // Add content based on type
      switch (this.type) {
        case 'receipt':
          this.addReceiptContent(pdf, yPosition, margin, contentWidth);
          break;
        case 'invoice':
          this.addInvoiceContent(pdf, yPosition, margin, contentWidth);
          break;
        case 'prescription':
          this.addPrescriptionContent(pdf, yPosition, margin, contentWidth);
          break;
        case 'inventory':
          this.addInventoryContent(pdf, yPosition, margin, contentWidth);
          break;
      }

      pdf.save(this.generateFileName());
      toast.success(`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    }
  }


  private addReceiptContent(pdf: jsPDF, yPosition: number, margin: number, contentWidth: number): void {
    pdf.setFontSize(12);
    pdf.text(`Receipt #: ${this.data.id}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Date: ${new Date(this.data.date).toLocaleDateString()}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Customer: ${this.data.customerName}`, margin, yPosition);
    yPosition += 15;

    // Table headers
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Item', margin + 2, yPosition + 5);
    pdf.text('Qty', margin + 80, yPosition + 5);
    pdf.text('Price', margin + 110, yPosition + 5);
    pdf.text('Total', margin + 140, yPosition + 5);
    yPosition += 8;

    // Table rows
    this.data.items.forEach((item: any) => {
      pdf.text(item.name, margin + 2, yPosition + 5);
      pdf.text(item.quantity.toString(), margin + 80, yPosition + 5);
      pdf.text(`${item.price.toFixed(2)} ETB`, margin + 110, yPosition + 5);
      pdf.text(`${(item.quantity * item.price).toFixed(2)} ETB`, margin + 140, yPosition + 5);
      yPosition += 8;
    });

    yPosition += 10;
    pdf.text(`Subtotal: ${this.data.subtotal.toFixed(2)} ETB`, margin + 100, yPosition);
    yPosition += 7;
    pdf.text(`Tax: ${this.data.tax.toFixed(2)} ETB`, margin + 100, yPosition);
    yPosition += 7;
    pdf.setFontSize(14);
    pdf.setTextColor(16, 185, 129);
    pdf.text(`Total: ${this.data.total.toFixed(2)} ETB`, margin + 100, yPosition);
  }

  private addInvoiceContent(pdf: jsPDF, yPosition: number, margin: number, contentWidth: number): void {
    pdf.setFontSize(12);
    pdf.text(`Invoice #: ${this.data.invoiceNumber}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Date: ${new Date(this.data.date).toLocaleDateString()}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Due Date: ${new Date(this.data.dueDate).toLocaleDateString()}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Customer: ${this.data.customerName}`, margin, yPosition);
    yPosition += 15;

    // Table headers
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Description', margin + 2, yPosition + 5);
    pdf.text('Qty', margin + 80, yPosition + 5);
    pdf.text('Unit Price', margin + 110, yPosition + 5);
    pdf.text('Total', margin + 140, yPosition + 5);
    yPosition += 8;

    // Table rows
    this.data.items.forEach((item: any) => {
      pdf.text(item.description, margin + 2, yPosition + 5);
      pdf.text(item.quantity.toString(), margin + 80, yPosition + 5);
      pdf.text(`${item.unitPrice.toFixed(2)} ETB`, margin + 110, yPosition + 5);
      pdf.text(`${item.total.toFixed(2)} ETB`, margin + 140, yPosition + 5);
      yPosition += 8;
    });

    yPosition += 10;
    pdf.text(`Subtotal: ${this.data.subtotal.toFixed(2)} ETB`, margin + 100, yPosition);
    yPosition += 7;
    pdf.text(`Tax (${this.data.taxRate}%): ${this.data.tax.toFixed(2)} ETB`, margin + 100, yPosition);
    yPosition += 7;
    pdf.setFontSize(14);
    pdf.setTextColor(59, 130, 246);
    pdf.text(`Total Due: ${this.data.total.toFixed(2)} ETB`, margin + 100, yPosition);
  }

  private addPrescriptionContent(pdf: jsPDF, yPosition: number, margin: number, contentWidth: number): void {
    pdf.setFontSize(12);
    pdf.text(`Prescription #: ${this.data.prescriptionNumber}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Patient: ${this.data.patientName}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Date of Birth: ${new Date(this.data.patientDOB).toLocaleDateString()}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Doctor: Dr. ${this.data.doctorName}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Date Prescribed: ${new Date(this.data.datePrescribed).toLocaleDateString()}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Valid Until: ${new Date(this.data.validUntil).toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Medications header
    pdf.setFontSize(12);
    pdf.setTextColor(16, 185, 129);
    pdf.text('Medications', margin, yPosition);
    yPosition += 10;

    // Table headers
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Medication', margin + 2, yPosition + 5);
    pdf.text('Dosage', margin + 70, yPosition + 5);
    pdf.text('Frequency', margin + 110, yPosition + 5);
    pdf.text('Duration', margin + 140, yPosition + 5);
    yPosition += 8;

    // Table rows
    this.data.medications.forEach((med: any) => {
      pdf.text(med.name, margin + 2, yPosition + 5);
      pdf.text(med.dosage, margin + 70, yPosition + 5);
      pdf.text(med.frequency, margin + 110, yPosition + 5);
      pdf.text(med.duration || 'N/A', margin + 140, yPosition + 5);
      yPosition += 8;
    });

    if (this.data.notes) {
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(16, 185, 129);
      pdf.text('Notes', margin, yPosition);
      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const splitNotes = pdf.splitTextToSize(this.data.notes, contentWidth - 10);
      pdf.text(splitNotes, margin + 5, yPosition);
    }
  }

  private addInventoryContent(pdf: jsPDF, yPosition: number, margin: number, contentWidth: number): void {
    pdf.setFontSize(12);
    pdf.text(`Pharmacy: ${this.data.pharmacyName}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Report Period: ${this.data.period}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Total Items: ${this.data.items.length}`, margin, yPosition);
    yPosition += 15;

    // Table headers
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Medicine', margin + 2, yPosition + 5);
    pdf.text('Stock', margin + 50, yPosition + 5);
    pdf.text('Reorder', margin + 75, yPosition + 5);
    pdf.text('Unit Price', margin + 100, yPosition + 5);
    pdf.text('Total Value', margin + 130, yPosition + 5);
    pdf.text('Expiry', margin + 160, yPosition + 5);
    yPosition += 8;

    // Table rows
    this.data.items.forEach((item: any) => {
      pdf.setFontSize(9);
      if (item.stock <= item.reorderLevel) {
        pdf.setTextColor(239, 68, 68);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(item.name.substring(0, 20), margin + 2, yPosition + 5);
      pdf.text(item.stock.toString(), margin + 50, yPosition + 5);
      pdf.text(item.reorderLevel.toString(), margin + 75, yPosition + 5);
      pdf.text(`${item.unitPrice.toFixed(2)}`, margin + 100, yPosition + 5);
      pdf.text(`${(item.stock * item.unitPrice).toFixed(2)}`, margin + 130, yPosition + 5);
      pdf.text(new Date(item.expiryDate).toLocaleDateString(), margin + 160, yPosition + 5);
      yPosition += 7;
    });

    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(139, 92, 246);
    pdf.text(`Total Inventory Value: ${this.data.totalValue.toFixed(2)} ETB`, margin, yPosition);
  }

}

// Quick export component for common use cases
export function QuickExport({ 
  data, 
  type 
}: { 
  data: any; 
  type: 'receipt' | 'invoice' | 'prescription' | 'inventory' 
}) {
  return (
    <div className="flex items-center space-x-2">
      <PDFExportComponent data={data} type={type} />
      <button
        className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => window.print()}
      >
        <Printer className="h-4 w-4 mr-1" />
        Print
      </button>
    </div>
  );
}
