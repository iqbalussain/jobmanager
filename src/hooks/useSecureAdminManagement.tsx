
import { useState } from 'react';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useAdminMutations } from '@/hooks/useAdminMutations';
import { validateEmail, validatePhone, validatePassword, sanitizeInput } from '@/utils/adminValidation';

// Re-export types for backward compatibility
export type {
  Customer,
  Designer,
  Salesman,
  JobTitle,
  Profile
} from '@/hooks/useAdminQueries';

export function useSecureAdminManagement() {
  // Get data and loading states from queries hook
  const {
    customers,
    designers,
    salesmen,
    jobTitles,
    profiles,
    customersLoading,
    designersLoading,
    salesmenLoading,
    jobTitlesLoading,
    profilesLoading,
    checkAdminAccess
  } = useAdminQueries();

  // Get mutations from mutations hook
  const {
    addCustomerMutation,
    addDesignerMutation,
    addSalesmanMutation,
    addJobTitleMutation,
    addUserMutation
  } = useAdminMutations(checkAdminAccess);

  // Form states with validation
  const [customerForm, setCustomerForm] = useState({ name: '' });
  const [designerForm, setDesignerForm] = useState({ name: '', phone: '' });
  const [salesmanForm, setSalesmanForm] = useState({ name: '', email: '', phone: '' });
  const [jobTitleForm, setJobTitleForm] = useState({ title: '' });
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: '',
    department: '',
    branch: '',
    phone: ''
  });

  return {
    // Data
    customers,
    designers,
    salesmen,
    jobTitles,
    profiles,
    
    // Loading states
    customersLoading,
    designersLoading,
    salesmenLoading,
    jobTitlesLoading,
    profilesLoading,
    
    // Form states
    customerForm,
    setCustomerForm,
    designerForm,
    setDesignerForm,
    salesmanForm,
    setSalesmanForm,
    jobTitleForm,
    setJobTitleForm,
    userForm,
    setUserForm,
    
    // Mutations
    addCustomerMutation,
    addDesignerMutation,
    addSalesmanMutation,
    addJobTitleMutation,
    addUserMutation,
    
    // Validation utilities
    validateEmail,
    validatePhone,
    validatePassword,
    sanitizeInput
  };
}
