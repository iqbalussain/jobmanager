// Centralized cache configuration for React Query
export const cacheConfig = {
  // Static/reference data - rarely changes
  customers: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  jobTitles: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  userRoles: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  },

  // Dynamic data - changes more frequently
  jobOrders: {
    minimal: {
      staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    full: {
      staleTime: 5 * 60 * 1000, // 5 minutes for full data
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    search: {
      staleTime: 1 * 60 * 1000, // 1 minute for search results
      gcTime: 3 * 60 * 1000, // 3 minutes
    }
  },

  // Real-time data
  activities: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  notifications: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  }
};

// Helper to get cache config for different query types
export function getCacheConfig(queryType: keyof typeof cacheConfig, subType?: string) {
  const config = cacheConfig[queryType];
  if (typeof config === 'object' && 'staleTime' in config) {
    return config;
  }
  if (subType && typeof config === 'object' && subType in config) {
    return (config as any)[subType];
  }
  // Default fallback
  return {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  };
}