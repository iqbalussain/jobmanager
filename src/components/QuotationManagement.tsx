import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, FileText, ArrowRight, Search, Image, Edit } from 'lucide-react';
import { useQuotations, type Quotation } from '@/hooks/useQuotations';
import { CreateQuotationDialog } from './CreateQuotationDialog';
import { QuotationDetails } from './QuotationDetails';
import { EditQuotationDialog } from './EditQuotationDialog';
import { BranchLogoUploader } from './BranchLogoUploader';
import { format } from 'date-fns';

export function QuotationManagement() {
  const { quotations, isLoading, convertToJobOrderMutation } = useQuotations();
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showLogoUploader, setShowLogoUploader] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.salesman_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsDetailsOpen(true);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsEditDialogOpen(true);
  };

  const handleConvertToJobOrder = async (quotationId: string) => {
    await convertToJobOrderMutation.mutateAsync(quotationId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotation Management</h1>
          <p className="text-muted-foreground">Create and manage quotations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowLogoUploader(true)} 
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            Upload Logo
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search quotations, customers, or salesmen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations ({filteredQuotations.length})</CardTitle>
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
                  <TableHead>Quotation #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Salesman</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                    <TableCell>{quotation.customer_name}</TableCell>
                    <TableCell>{quotation.salesman_name}</TableCell>
                    <TableCell>${quotation.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={getStatusColor(quotation.status)}
                      >
                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(quotation.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(quotation)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {!quotation.converted_to_job_order_id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuotation(quotation)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConvertToJobOrder(quotation.id)}
                              disabled={convertToJobOrderMutation.isPending}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <ArrowRight className="w-4 h-4 mr-1" />
                              Convert
                            </Button>
                          </>
                        )}
                        {quotation.converted_to_job_order_id && (
                          <Badge variant="secondary" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            Converted
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredQuotations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No quotations found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateQuotationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
      
      <BranchLogoUploader
        isOpen={showLogoUploader}
        onClose={() => setShowLogoUploader(false)}
      />

      {selectedQuotation && (
        <>
          <QuotationDetails
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedQuotation(null);
            }}
            quotation={selectedQuotation}
          />
          <EditQuotationDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedQuotation(null);
            }}
            quotation={selectedQuotation}
          />
        </>
      )}
    </div>
  );
}