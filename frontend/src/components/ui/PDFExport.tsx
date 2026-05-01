import React, { useState } from 'react';
import { Download, FileText, Receipt, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

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

  private createTempElement(): HTMLElement {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '800px';
    element.style.padding = '40px';
    element.style.backgroundColor = 'white';
    element.style.fontFamily = 'Arial, sans-serif';

    switch (this.type) {
      case 'receipt':
        element.innerHTML = this.generateReceiptHTML();
        break;
      case 'invoice':
        element.innerHTML = this.generateInvoiceHTML();
        break;
      case 'prescription':
        element.innerHTML = this.generatePrescriptionHTML();
        break;
      case 'inventory':
        element.innerHTML = this.generateInventoryHTML();
        break;
      default:
        element.innerHTML = '<div>No content to export</div>';
    }

    return element;
  }

  async generatePDF(): Promise<void> {
    try {
      const element = this.createTempElement();
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = this.generateFileName();
      link.href = imgData;
      link.click();

      document.body.removeChild(element);

      toast.success(`${this.type.charAt(0).toUpperCase() + this.type.slice(1)} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    }
  }

  private generateReceiptHTML(): string {
    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #10b981;">Pharmacy Receipt</h1>
        <p style="margin: 5px 0; color: #6b7280;">Thank you for your purchase</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Receipt #:</strong> ${this.data.id}</p>
        <p><strong>Date:</strong> ${new Date(this.data.date).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${this.data.customerName}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Item</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Qty</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Price</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.items.map((item: any) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.name}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${item.price.toFixed(2)} ETB</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${(item.quantity * item.price).toFixed(2)} ETB</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px;">
        <p><strong>Subtotal:</strong> ${this.data.subtotal.toFixed(2)} ETB</p>
        <p><strong>Tax:</strong> ${this.data.tax.toFixed(2)} ETB</p>
        <p style="font-size: 18px; color: #10b981;"><strong>Total:</strong> ${this.data.total.toFixed(2)} ETB</p>
      </div>

      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>This is a computer-generated receipt</p>
        <p>Thank you for choosing our pharmacy</p>
      </div>
    `;
  }

  private generateInvoiceHTML(): string {
    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #3b82f6;">Invoice</h1>
        <p style="margin: 5px 0; color: #6b7280;">Invoice #${this.data.invoiceNumber}</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <p><strong>Bill To:</strong></p>
          <p>${this.data.customerName}</p>
          <p>${this.data.customerAddress}</p>
          <p>${this.data.customerPhone}</p>
        </div>
        <div style="text-align: right;">
          <p><strong>Invoice Date:</strong> ${new Date(this.data.date).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${new Date(this.data.dueDate).toLocaleDateString()}</p>
          <p><strong>Invoice #:</strong> ${this.data.invoiceNumber}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Description</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Qty</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.items.map((item: any) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.description}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${item.unitPrice.toFixed(2)} ETB</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${item.total.toFixed(2)} ETB</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px;">
        <p><strong>Subtotal:</strong> ${this.data.subtotal.toFixed(2)} ETB</p>
        <p><strong>Tax (${this.data.taxRate}%):</strong> ${this.data.tax.toFixed(2)} ETB</p>
        <p style="font-size: 18px; color: #3b82f6;"><strong>Total Due:</strong> ${this.data.total.toFixed(2)} ETB</p>
      </div>
    `;
  }

  private generatePrescriptionHTML(): string {
    return `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px;">
        <h1 style="margin: 0; color: #10b981;">Medical Prescription</h1>
        <p style="margin: 5px 0; color: #6b7280;">Prescription #${this.data.prescriptionNumber}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Patient:</strong> ${this.data.patientName}</p>
        <p><strong>Date of Birth:</strong> ${new Date(this.data.patientDOB).toLocaleDateString()}</p>
        <p><strong>Doctor:</strong> Dr. ${this.data.doctorName}</p>
        <p><strong>Date Prescribed:</strong> ${new Date(this.data.datePrescribed).toLocaleDateString()}</p>
        <p><strong>Valid Until:</strong> ${new Date(this.data.validUntil).toLocaleDateString()}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #10b981; margin-bottom: 10px;">Medications</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Medication</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Dosage</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Frequency</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.medications.map((med: any) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${med.name}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${med.dosage}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${med.frequency}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${med.duration}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${this.data.notes ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #10b981; margin-bottom: 10px;">Notes</h3>
          <p style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #10b981;">
            ${this.data.notes}
          </p>
        </div>
      ` : ''}

      <div style="margin-top: 40px; text-align: center;">
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="color: #6b7280; font-size: 12px;">QR Code: ${this.data.qrCode}</p>
          <p style="color: #6b7280; font-size: 12px;">Verification Hash: ${this.data.qrHash}</p>
        </div>
      </div>
    `;
  }

  private generateInventoryHTML(): string {
    return `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #8b5cf6;">Inventory Report</h1>
        <p style="margin: 5px 0; color: #6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Pharmacy:</strong> ${this.data.pharmacyName}</p>
        <p><strong>Report Period:</strong> ${this.data.period}</p>
        <p><strong>Total Items:</strong> ${this.data.items.length}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Medicine</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Stock</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Reorder Level</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Total Value</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.items.map((item: any) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.name}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb; color: ${item.stock <= item.reorderLevel ? '#ef4444' : '#10b981'};">
                ${item.stock}
              </td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${item.reorderLevel}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${item.unitPrice.toFixed(2)} ETB</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${(item.stock * item.unitPrice).toFixed(2)} ETB</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(item.expiryDate).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px;">
        <p><strong>Total Inventory Value:</strong> ${this.data.totalValue.toFixed(2)} ETB</p>
      </div>
    `;
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
