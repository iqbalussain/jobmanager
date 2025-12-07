// This hook is disabled - job_order_items table does not exist in the current schema
// Keeping interface definitions for backward compatibility

export interface JobOrderItem {
  id: string;
  job_order_id: string;
  job_title_id: string;
  description: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  order_sequence: number;
  job_titles?: {
    job_title_id: string;
  };
}

export interface CreateJobOrderItemData {
  job_order_id: string;
  job_title_id: string;
  description: string;
  quantity: number;
  unit_price?: number;
  order_sequence: number;
}

// Stub mutation type for compatibility
const stubMutation = {
  mutate: (_data?: unknown) => {},
  mutateAsync: async (_data?: unknown) => {},
  isPending: false
};

export function useJobOrderItems(_jobOrderId: string) {
  // Table does not exist - return empty state with stub mutations
  return {
    items: [] as JobOrderItem[],
    isLoading: false,
    error: null,
    addItemMutation: stubMutation,
    updateItemMutation: stubMutation,
    deleteItemMutation: stubMutation
  };
}
