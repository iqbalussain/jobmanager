import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, FileText, Calendar, User, Building } from 'lucide-react';
import { useQuotationItems } from '@/hooks/useQuotations';
import { format } from 'date-fns';
import type { Quotation } from '@/hooks/useQuotations';

interface QuotationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
}

export function QuotationDetails({ isOpen, onClose, quotation }: QuotationDetailsProps) {
  const { items, isLoading } = useQuotationItems(quotation.id);

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      case 'sent': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'accepted': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'converted': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Quotation Details</DialogTitle>
            <Badge 
              variant="outline"
              className={getStatusColor(quotation.status)}
            >
              {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {quotation.quotation_number}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Customer</div>
                    <div className="font-medium">{quotation.customer_name}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Salesman</div>
                    <div className="font-medium">{quotation.salesman_name}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="font-medium">{format(new Date(quotation.created_at), 'MMM dd, yyyy')}</div>
                  </div>
                </div>
              </div>

              {quotation.notes && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Notes</div>
                  <div className="text-sm">{quotation.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Items</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.job_title}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">${item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell colSpan={4} className="text-right font-semibold">
                        Grand Total:
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        ${quotation.total_amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Conversion Status */}
          {quotation.converted_to_job_order_id && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700">
                  <ArrowRight className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Converted to Job Order</div>
                    <div className="text-sm text-green-600">
                      This quotation has been successfully converted to a job order.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}