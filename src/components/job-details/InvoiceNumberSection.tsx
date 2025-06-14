import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoiceNumberSectionProps {
  invoiceNumber: string;
  onInvoiceNumberChange: (value: string) => void;
  canEditInvoice: boolean;
}

export function InvoiceNumberSection({
  invoiceNumber,
  onInvoiceNumberChange,
  canEditInvoice
}: InvoiceNumberSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-blue-700/30 p-4 rounded-lg border border-blue-400/30 backdrop-blur-md shadow-xl dark:shadow-slate-800">
      <div className="space-y-2">
        <Label htmlFor="invoiceNumber" className="text-sm font-medium text-blue-200">
          Invoice Number (Optional)
          {!canEditInvoice && ' - View Only (Admin / Job manager only)'}
        </Label>
        <Input
          id="invoiceNumber"
          value={invoiceNumber}
          onChange={(e) => onInvoiceNumberChange(e.target.value)}
          placeholder={canEditInvoice ? "Enter invoice number for PDF export" : "You are not authorized to edit"}
          className="bg-white/90 dark:bg-slate-900/70 text-black dark:text-white font-mono transition-colors"
          disabled={!canEditInvoice}
        />
        <p className="text-xs text-blue-300">
          {canEditInvoice
            ? "This will appear at the top of the exported PDF and be saved to the job order."
            : "Only Admin and Job Order Manager roles can edit invoice numbers."}
        </p>
      </div>
    </div>
  );
}
