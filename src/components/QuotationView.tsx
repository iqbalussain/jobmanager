import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Edit, FileText } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { QuotationPDF } from '@/utils/pdf/quotation';
import { downloadQuotationPDF, type QuotationContent } from '@/services/quotations';
import { useToast } from '@/hooks/use-toast';
import { QuotationEditor } from './QuotationEditor';
import { format } from 'date-fns';

interface QuotationViewProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: {
    id: string;
    quotation_number: string;
    customer_id: string;
    salesman_id: string;
    status: string;
    total_amount: number;
    content?: QuotationContent;
    created_at: string;
    customer_name?: string;
    salesman_name?: string;
  };
}

export function QuotationView({ isOpen, onClose, quotation }: QuotationViewProps) {
  const { toast } = useToast();
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const hasContent = quotation.content && quotation.content.items && quotation.content.items.length > 0;

  const handleDownload = async () => {
    if (!hasContent) {
      toast({
        title: 'No Content',
        description: 'This quotation has no content to export. Please edit it first.',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    try {
      await downloadQuotationPDF(
        quotation.content!,
        `quotation-${quotation.quotation_number}.pdf`
      );
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    if (!hasContent) {
      toast({
        title: 'No Content',
        description: 'This quotation has no content to preview. Please edit it first.',
        variant: 'destructive',
      });
      return;
    }
    setShowPDFPreview(true);
  };

  const getStatusColor = (status: string) => {
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
    <>
      <Dialog open={isOpen && !showPDFPreview && !showEditor} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quotation Number</p>
                    <p className="font-semibold">{quotation.quotation_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className={getStatusColor(quotation.status)}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-semibold">{quotation.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salesman</p>
                    <p className="font-semibold">{quotation.salesman_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-lg">{quotation.total_amount.toFixed(3)} OMR</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-semibold">{format(new Date(quotation.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Summary */}
            {hasContent && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Items ({quotation.content!.items.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {quotation.content!.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Qty: {item.quantity} × {item.unitPrice.toFixed(3)} OMR
                            {item.discount ? ` (${item.discount}% off)` : ''}
                          </p>
                        </div>
                        <p className="font-semibold">{item.total.toFixed(3)} OMR</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!hasContent && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No content available for this quotation.</p>
                    <p className="text-sm mt-1">Edit the quotation to add items and details.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditor(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePreview}
                disabled={!hasContent}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview PDF
              </Button>
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading || !hasContent}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      {showPDFPreview && hasContent && (
        <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
          <DialogContent className="max-w-5xl h-[90vh]">
            <DialogHeader>
              <DialogTitle>PDF Preview - {quotation.quotation_number}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 h-full">
              <PDFViewer width="100%" height="100%" className="border-0">
                <QuotationPDF content={quotation.content!} />
              </PDFViewer>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Editor Dialog */}
      {showEditor && (
        <QuotationEditor
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          quotationId={quotation.id}
          customerId={quotation.customer_id}
          salesmanId={quotation.salesman_id}
          initialContent={quotation.content}
          quotationNumber={quotation.quotation_number}
        />
      )}
    </>
  );
}
