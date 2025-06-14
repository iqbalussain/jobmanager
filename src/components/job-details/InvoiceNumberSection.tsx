
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
    <div className="glass-gaming p-4 rounded-lg gaming-border">
      <div className="space-y-2">
        <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gaming-glow">
          Invoice Number (Optional) {!canEditInvoice && '- View Only'}
        </Label>
        <Input
          id="invoiceNumber"
          value={invoiceNumber}
          onChange={(e) => onInvoiceNumberChange(e.target.value)}
          placeholder={canEditInvoice ? "Enter invoice number for PDF export" : "Not authorized to edit"}
          className="glass-gaming border-gaming-border"
          disabled={!canEditInvoice}
        />
        <p className="text-xs text-gaming-glow">
          {canEditInvoice 
            ? "This will appear at the top of the exported PDF and be saved to the job order." 
            : "Only authorized users (Admin) can edit invoice numbers."
          }
        </p>
      </div>
    </div>
  );
}
