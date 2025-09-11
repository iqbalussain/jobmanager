import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useQuotations } from '@/hooks/useQuotations';
import { useDropdownData } from '@/hooks/useDropdownData';

interface QuotationItem {
  job_title_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  order_sequence: number;
}

interface CreateQuotationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateQuotationDialog({ isOpen, onClose }: CreateQuotationDialogProps) {
  const { createQuotationMutation } = useQuotations();
  const { customers, salesmen, jobTitles, isLoading } = useDropdownData();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    salesman_id: '',
    notes: ''
  });
  
  const [items, setItems] = useState<QuotationItem[]>([
    {
      job_title_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      order_sequence: 0
    }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        job_title_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        order_sequence: items.length
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.salesman_id) {
      return;
    }

    const validItems = items.filter(item => 
      item.job_title_id && item.description && item.quantity > 0 && item.unit_price > 0
    );

    if (validItems.length === 0) {
      return;
    }

    try {
      // First create the quotation
      const quotation = await createQuotationMutation.mutateAsync(formData);
      
      // Then add the items
      const { supabase } = await import('@/integrations/supabase/client');
      
      for (const item of validItems) {
        await supabase.from('quotation_items').insert({
          quotation_id: quotation.id,
          ...item,
          total_price: item.quantity * item.unit_price
        });
      }

      // Reset form
      setFormData({ customer_id: '', salesman_id: '', notes: '' });
      setItems([{
        job_title_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        order_sequence: 0
      }]);
      
      onClose();
    } catch (error) {
      console.error('Error creating quotation:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quotation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="salesman">Salesman *</Label>
              <Select
                value={formData.salesman_id}
                onValueChange={(value) => setFormData({ ...formData, salesman_id: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select salesman" />
                </SelectTrigger>
                <SelectContent>
                  {salesmen.map((salesman) => (
                    <SelectItem key={salesman.id} value={salesman.id}>
                      {salesman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes for this quotation..."
              rows={3}
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-medium">Quotation Items</Label>
              <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                      <div>
                        <Label>Job Title *</Label>
                        <Select
                          value={item.job_title_id}
                          onValueChange={(value) => handleItemChange(index, 'job_title_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job title" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobTitles.map((jobTitle) => (
                              <SelectItem key={jobTitle.id} value={jobTitle.id}>
                                {jobTitle.job_title_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>

                      <div>
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div>
                        <Label>Unit Price *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          Total: ${(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end mt-4">
              <div className="text-lg font-semibold">
                Grand Total: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createQuotationMutation.isPending || !formData.customer_id || !formData.salesman_id}
            >
              {createQuotationMutation.isPending ? 'Creating...' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}