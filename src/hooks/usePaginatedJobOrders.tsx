import { useState, useMemo } from 'react';
import { useJobOrdersOptimized } from './useJobOrdersOptimized';
import { JobOrder } from '@/types/jobOrder';

interface UsePaginatedJobOrdersOptions {
  pageSize?: number;
  defaultStatus?: string;
}

export function usePaginatedJobOrders(options: UsePaginatedJobOrdersOptions = {}) {
  const { pageSize = 50, defaultStatus = 'all' } = options;
  
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const offset = currentPage * pageSize;

  const {
    jobOrders,
    isLoading,
    isFetching,
    error,
    refetch
  } = useJobOrdersOptimized({
    limit: pageSize,
    offset,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  });

  // Calculate stats from current page data
  const stats = useMemo(() => {
    const total = jobOrders.length;
    const pending = jobOrders.filter(job => job.status === 'pending').length;
    const inProgress = jobOrders.filter(job => job.status === 'in-progress').length;
    const designing = jobOrders.filter(job => job.status === 'designing').length;
    const completed = jobOrders.filter(job => job.status === 'completed').length;
    const finished = jobOrders.filter(job => job.status === 'finished').length;
    const cancelled = jobOrders.filter(job => job.status === 'cancelled').length;
    const invoiced = jobOrders.filter(job => job.status === 'invoiced').length;

    return {
      total,
      pending,
      inProgress,
      designing,
      completed,
      finished,
      cancelled,
      invoiced
    };
  }, [jobOrders]);

  const hasNextPage = jobOrders.length === pageSize;
  const hasPreviousPage = currentPage > 0;

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(0); // Reset to first page when search changes
  };

  const handleDateFilterChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setCurrentPage(0); // Reset to first page when date filter changes
  };

  return {
    // Data
    jobOrders,
    stats,
    
    // Loading states
    isLoading,
    isFetching,
    error,
    
    // Pagination
    currentPage,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    
    // Filters
    statusFilter,
    searchQuery,
    dateFrom,
    dateTo,
    handleStatusFilterChange,
    handleSearchChange,
    handleDateFilterChange,
    
    // Actions
    refetch
  };
}