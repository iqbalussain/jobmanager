import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveQuotation, type QuotationContent } from '@/services/quotations';
import { useQueryClient } from '@tanstack/react-query';

const quotationSchema = z.object({
  company: z.object({
    name: z.string().min(1, 'Company name required'),
    logo: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  }),
  client: z.object({
    name: z.string().min(1, 'Client name required'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  }),
  quotationNumber: z.string().min(1, 'Quotation number required'),
  date: z.string().min(1, 'Date required'),
  validUntil: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    discount: z.number().min(0).max(100).optional(),
    total: z.number(),
  })).min(1, 'At least one item required'),
  taxes: z.object({
    subtotal: z.number(),
    vatRate: z.number().optional(),
    vatAmount: z.number().optional(),
    total: z.number(),
  }),
  terms: z.string().optional(),
  notes: z.string().optional(),
  signature: z.object({
    name: z.string().min(1, 'Signature name required'),
    title: z.string().min(1, 'Signature title required'),
  }).optional(),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuotationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId?: string;
  customerId: string;
  salesmanId: string;
  initialContent?: QuotationContent;
  quotationNumber?: string;
}

export function QuotationEditor({ 
  isOpen, 
  onClose, 
  quotationId,
  customerId,
  salesmanId,
  initialContent,
  quotationNumber 
}: QuotationEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues: QuotationFormData = {
    company: {
      name: 'PrintWaves Oman',
      address: 'Muscat, Oman',
      phone: '+968 1234 5678',
      email: 'info@printwavesoman.com',
    },
    client: { name: '', address: '', phone: '', email: '' },
    quotationNumber: quotationNumber || '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }],
    taxes: { subtotal: 0, vatRate: 0.05, vatAmount: 0, total: 0 },
    terms: 'Payment due within 30 days. Prices are in Omani Rials.',
    notes: '',
    signature: { name: '', title: 'Sales Manager' },
  };

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (initialContent) {
      form.reset({
        ...defaultValues,
        ...initialContent,
        company: { ...defaultValues.company, ...initialContent.company },
        client: { ...defaultValues.client, ...initialContent.client },
        taxes: { ...defaultValues.taxes, ...initialContent.taxes },
        signature: initialContent.signature ? { ...initialContent.signature } : defaultValues.signature,
      });
    }
  }, [initialContent]);

  const calculateTotals = () => {
    const items = form.getValues('items');
    const subtotal = items.reduce((sum, item) => {
      const discount = item.discount || 0;
      const itemTotal = item.quantity * item.unitPrice * (1 - discount / 100);
      return sum + itemTotal;
    }, 0);

    const vatRate = form.getValues('taxes.vatRate') || 0;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    form.setValue('taxes.subtotal', subtotal);
    form.setValue('taxes.vatAmount', vatAmount);
    form.setValue('taxes.total', total);

    // Update individual item totals
    items.forEach((item, index) => {
      const discount = item.discount || 0;
      const itemTotal = item.quantity * item.unitPrice * (1 - discount / 100);
      form.setValue(`items.${index}.total`, itemTotal);
    });
  };

  const onSubmit = async (data: QuotationFormData) => {
    setIsSaving(true);
    try {
      await saveQuotation({
        id: quotationId,
        customer_id: customerId,
        salesman_id: salesmanId,
        content: data as QuotationContent,
        notes: data.notes,
      });

      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      
      toast({
        title: 'Success',
        description: quotationId ? 'Quotation updated successfully' : 'Quotation created successfully',
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quotation',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quotationId ? 'Edit Quotation' : 'Create Quotation'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Company Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Client Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Quotation Details */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-4 gap-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qty</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                    calculateTotals();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.001"
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                    calculateTotals();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.discount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount %</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                    calculateTotals();
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.total`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" disabled />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        remove(index);
                        calculateTotals();
                      }}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Display */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{form.watch('taxes.subtotal')?.toFixed(3) || '0.000'} OMR</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (5%):</span>
                  <span>{form.watch('taxes.vatAmount')?.toFixed(3) || '0.000'} OMR</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total:</span>
                  <span>{form.watch('taxes.total')?.toFixed(3) || '0.000'} OMR</span>
                </div>
              </div>
            </div>

            {/* Terms and Signature */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="signature.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="signature.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Quotation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
