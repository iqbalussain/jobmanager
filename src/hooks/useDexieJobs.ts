import { useState, useEffect, useCallback, useMemo } from 'react';
import { db, DexieJobOrder } from '@/lib/dexieDb';
import { 
  needsInitialSync, 
  performInitialSync, 
  performDeltaSync, 
  startBackgroundSync, 
  stopBackgroundSync,
  repairMissingJobs
} from '@/services/syncService';
import { useLiveQuery } from 'dexie-react-hooks';

export interface JobFilters {
  status?: string;
  branch?: string;
  salesman?: string;
  customer?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function useDexieJobs(
  filters: JobFilters = {}, 
  page: number = 1, 
  pageSize: number = 50,
  returnAllJobs: boolean = false
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Initialize sync on mount
  useEffect(() => {
    const initSync = async () => {
      setIsLoading(true);
      setSyncError(null);
      
      try {
        if (await needsInitialSync()) {
          setIsSyncing(true);
          await performInitialSync();
          setIsSyncing(false);
        } else {
          // Quick delta sync on load
          setIsSyncing(true);
          await performDeltaSync();
          
          // Check for and repair any missing jobs
          const repairedCount = await repairMissingJobs();
          if (repairedCount > 0) {
            console.log(`[Sync] Repaired ${repairedCount} missing jobs on startup`);
          }
          setIsSyncing(false);
        }
        
        // Start background sync
        startBackgroundSync();
      } catch (error) {
        console.error('Sync initialization error:', error);
        setSyncError(error instanceof Error ? error.message : 'Sync failed');
        setIsSyncing(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initSync();
    
    return () => {
      stopBackgroundSync();
    };
  }, []);

  // Live query all jobs from Dexie
  const allJobs = useLiveQuery(
    () => db.jobs.orderBy('created_at').reverse().toArray(),
    []
  );

  // Apply filters client-side
  const filteredJobs = useMemo(() => {
    if (!allJobs) return [];
    
    let result = [...allJobs];
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter(job => job.status === filters.status);
    }
    
    // Branch filter
    if (filters.branch && filters.branch !== 'all') {
      result = result.filter(job => job.branch === filters.branch);
    }
    
    // Salesman filter - by name
    if (filters.salesman && filters.salesman !== 'all') {
      result = result.filter(job => job.salesman_name === filters.salesman);
    }
    
    // Customer filter - by name
    if (filters.customer && filters.customer !== 'all') {
      result = result.filter(job => job.customer_name === filters.customer);
    }
    
    // Search filter
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase().trim();
      result = result.filter(job => 
        job.job_order_number?.toLowerCase().includes(searchLower) ||
        job.job_order_details?.toLowerCase().includes(searchLower) ||
        job.client_name?.toLowerCase().includes(searchLower) ||
        job.assignee?.toLowerCase().includes(searchLower) ||
        job.customer_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Date range filter
    if (filters.dateFrom) {
      const fromDate = filters.dateFrom.toISOString();
      result = result.filter(job => job.created_at >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = filters.dateTo.toISOString();
      result = result.filter(job => job.created_at <= toDate);
    }
    
    return result;
  }, [allJobs, filters]);

  // Calculate pagination from filtered results
  const totalCount = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(page, totalPages);
  
  const paginatedJobs = useMemo(() => {
    if (returnAllJobs) {
      return filteredJobs; // Return all filtered jobs without slicing
    }
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, safeCurrentPage, pageSize, returnAllJobs]);

  // Get unique filter options from all jobs
  const filterOptions = useMemo(() => {
    if (!allJobs) return { salesmen: [], customers: [], branches: [] };
    
    const salesmenSet = new Set<string>();
    const customersSet = new Set<string>();
    const branchesSet = new Set<string>();
    
    allJobs.forEach(job => {
      if (job.salesman_name && job.salesman_name !== 'Unassigned') {
        salesmenSet.add(job.salesman_name);
      }
      if (job.customer_name && job.customer_name !== 'Unknown Customer') {
        customersSet.add(job.customer_name);
      }
      if (job.branch) {
        branchesSet.add(job.branch);
      }
    });
    
    return {
      salesmen: Array.from(salesmenSet).sort(),
      customers: Array.from(customersSet).sort(),
      branches: Array.from(branchesSet).sort()
    };
  }, [allJobs]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      await performDeltaSync();
    } catch (error) {
      console.error('Manual refresh error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    jobs: paginatedJobs,
    allJobs: filteredJobs,
    totalCount,
    totalPages,
    currentPage: safeCurrentPage,
    isLoading,
    isSyncing,
    syncError,
    filterOptions,
    refresh
  };
}

// Hook to get customers from Dexie
export function useDexieCustomers() {
  return useLiveQuery(() => db.customers.orderBy('name').toArray(), []);
}

// Hook to get salesmen from Dexie
export function useDexieSalesmen() {
  return useLiveQuery(() => db.salesmen.orderBy('name').toArray(), []);
}

// Hook to get job titles from Dexie
export function useDexieJobTitles() {
  return useLiveQuery(() => db.jobTitles.toArray(), []);
}
