// This file is no longer needed - functionality moved to useJobOrders hook
// Keeping file for backward compatibility but marking as deprecated

export function useJobOrderMutations() {
  console.warn('useJobOrderMutations is deprecated. Use useJobOrders hook instead.');
  
  return {
    updateStatus: () => {},
    updateJobData: () => {},
    approveJob: () => {},
    isApprovingJob: false
  };
}
