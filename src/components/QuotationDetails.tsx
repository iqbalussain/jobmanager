import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRight, FileText, Calendar, User, Building, Printer, ExternalLink } from 'lucide-react';
import { useQuotationItems, useQuotations } from '@/hooks/useQuotations';
import { exportQuotationToPDF } from "@/utils/quotationPdfExport";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from 'date-fns';
import type { Quotation } from '@/hooks/useQuotations';

interface QuotationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
}

export function QuotationDetails({ isOpen, onClose, quotation }: QuotationDetailsProps) {
  const { items, isLoading } = useQuotationItems(quotation.id);
  const { convertToJobOrderMutation } = useQuotations();
  const { toast } = useToast();
  const [selectedBranch, setSelectedBranch] = useState("Head Office");
  const [isExporting, setIsExporting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handlePrintQuotation = async () => {
    if (!selectedBranch) {
      toast({
        title: "Error",
        description: "Please select a branch for the letterhead",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportQuotationToPDF(quotation, items, selectedBranch);
      toast({
        title: "Success",
        description: "Quotation exported to PDF successfully",
      });
    } catch (error) {
      console.error('Error exporting quotation:', error);
      toast({
        title: "Error",
        description: "Failed to export quotation to PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleConvertToJobOrder = async () => {
    if (quotation.status === 'converted') {
      toast({
        title: "Already Converted",
        description: "This quotation has already been converted to a job order",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    try {
      // Import and use the enhanced conversion function
      const { convertQuotationToJobOrderWithItems } = await import('@/utils/enhancedQuotationConversion');
      await convertQuotationToJobOrderWithItems(quotation, items);
      
      toast({
        title: "Quotation converted",
        description: "Successfully converted quotation to job order with all items"
      });
      
      // Refresh the quotation data to show updated status
      onClose();
    } catch (error) {
      console.error('Error converting quotation:', error);
      toast({
        title: "Error",
        description: "Failed to convert quotation to job order",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

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
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={getStatusColor(quotation.status)}
              >
                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
              </Badge>
              {quotation.status !== 'converted' && (
                <Button
                  onClick={handleConvertToJobOrder}
                  disabled={isConverting}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {isConverting ? 'Converting...' : 'Convert to Job Order'}
                </Button>
              )}
              <Button
                onClick={handlePrintQuotation}
                disabled={isExporting}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Print'}
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {quotation.quotation_number}
                </div>
                {quotation.status === 'converted' && quotation.converted_to_job_order_id && (
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View Job Order
                  </Button>
                )}
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

              {quotation.converted_to_job_order_id && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 font-medium">
                    ✓ This quotation has been converted to a job order
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Job Order ID: {quotation.converted_to_job_order_id}
                  </p>
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
                        <TableCell className="text-right">OMR {item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">OMR {item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell colSpan={4} className="text-right font-semibold">
                        Grand Total:
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        OMR {quotation.total_amount.toFixed(2)}
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

          {/* Print Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Print Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="branch-select">Select Company Branch for Letterhead</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Head Office">Head Office</SelectItem>
                      <SelectItem value="Wadi Kabeer">Wadi Kabeer</SelectItem>
                      <SelectItem value="Wajihat Ruwi">Wajihat Ruwi</SelectItem>
                      <SelectItem value="Ruwi Branch">Ruwi Branch</SelectItem>
                      <SelectItem value="Ghubra Branch">Ghubra Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}