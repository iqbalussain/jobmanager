import { useJobOrdersQuery } from './useJobOrdersQuery';
import { JobOrdersQueryOptions } from '@/services/jobOrdersApi';

// Optimized hook for dashboard - minimal data
export function useDashboardJobOrders() {
  return useJobOrdersQuery({
    usePagination: true,
    pageSize: 20,
    fields: 'minimal'
  });
}

// Optimized hook for job management with pagination
export function useJobManagement(filters: Partial<JobOrdersQueryOptions> = {}) {
  return useJobOrdersQuery({
    usePagination: true,
    pageSize: 25,
    fields: 'full',
    ...filters
  });
}

// Hook for quick search/filtering
export function useJobSearch(searchTerm: string) {
  return useJobOrdersQuery({
    usePagination: true,
    pageSize: 15,
    fields: 'minimal',
    search: searchTerm,
    enabled: searchTerm.length > 2 // Only search if more than 2 characters
  });
}

// Hook for specific status views
export function useJobsByStatus(status: string) {
  return useJobOrdersQuery({
    usePagination: true,
    pageSize: 30,
    status,
    fields: 'full'
  });
}

// Legacy hook for components that need all data at once
export function useAllJobOrders() {
  return useJobOrdersQuery({
    usePagination: false // Uses the legacy fetchAllJobOrders
  });
}