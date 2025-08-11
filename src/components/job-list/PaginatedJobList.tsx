import { useState } from 'react';
import { useJobManagement } from '@/hooks/useOptimizedJobOrders';
import { JobCard } from './JobCard';
import { EmptyJobState } from './EmptyJobState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Job } from '@/pages/Index';
import { JobOrder } from '@/types/jobOrder';

interface PaginatedJobListProps {
  onStatusUpdate?: (jobId: string, status: string) => void;
  onViewDetails?: (job: Job) => void;
}

// Transform JobOrder to Job for backward compatibility
function transformJobOrderToJob(jobOrder: JobOrder): Job {
  return {
    id: jobOrder.id,
    jobOrderNumber: jobOrder.job_order_number,
    title: jobOrder.job_title?.job_title_id || jobOrder.job_order_details || 'Untitled Job',
    customer: jobOrder.customer?.name || 'Unknown Customer',
    assignee: jobOrder.assignee || undefined,
    designer: jobOrder.designer?.name || undefined,
    salesman: jobOrder.salesman?.name || undefined,
    priority: jobOrder.priority === 'urgent' ? 'high' : jobOrder.priority as 'low' | 'medium' | 'high',
    status: jobOrder.status,
    dueDate: jobOrder.due_date,
    estimatedHours: jobOrder.estimated_hours || 0,
    createdAt: jobOrder.created_at,
    branch: jobOrder.branch || undefined,
    jobOrderDetails: jobOrder.job_order_details || undefined,
    invoiceNumber: jobOrder.invoice_number || undefined,
    totalValue: jobOrder.total_value || undefined,
    customer_id: jobOrder.customer_id,
    job_title_id: jobOrder.job_title_id,
    created_by: jobOrder.created_by,
    approval_status: jobOrder.approval_status,
    deliveredAt: jobOrder.delivered_at || undefined
  };
}

export function PaginatedJobList({ onStatusUpdate, onViewDetails }: PaginatedJobListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    branch: '',
    priority: ''
  });

  const { 
    jobOrders, 
    isLoading, 
    error, 
    totalCount, 
    totalPages,
    refetch 
  } = useJobManagement({
    page: currentPage,
    ...filters
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  // Transform JobOrders to Jobs
  const transformedJobs = jobOrders.map(transformJobOrderToJob);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading job orders: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom header with optimized search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.status} onValueChange={(status) => handleFilterChange({ status })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="designing">Designing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="invoiced">Invoiced</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-sm text-muted-foreground flex items-center">
            {totalCount || 0} jobs total
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : transformedJobs.length === 0 ? (
        <EmptyJobState />
      ) : (
        <>
          <div className="space-y-4">
            {transformedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={onViewDetails || (() => {})}
                onStatusChange={onStatusUpdate || (() => {})}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 25) + 1} to {Math.min(currentPage * 25, totalCount || 0)} of {totalCount || 0} jobs
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}