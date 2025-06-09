
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Customer {
  id: string;
  name: string;
}

export interface Designer {
  id: string;
  name: string;
  phone: string | null;
}

export interface Salesman {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface JobTitle {
  id: string;
  job_title_id: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  department: string | null;
  branch: string | null;
  phone: string | null;
}

// Input validation utilities
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"'&]/g, '');
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
  }
  return { valid: true, message: '' };
};

// Define allowed roles with strict validation
const allowedRoles = ["admin", "manager", "employee", "designer", "salesman", "job_order_manager"] as const;
type Role = typeof allowedRoles[number];

function isValidRole(role: string): role is Role {
  return allowedRoles.includes(role as Role);
}

export function useSecureAdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  // Authorization check hook
  const checkAdminAccess = () => {
    if (!user) {
      throw new Error('Authentication required');
    }
    return true;
  };

  // Data queries with proper error handling
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      checkAdminAccess();
      console.log('Fetching customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      console.log('Customers fetched:', data);
      return data as Customer[];
    },
    enabled: !!user
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      checkAdminAccess();
      console.log('Fetching designers...');
      const { data, error } = await supabase
        .from('designers')
        .select('id, name, phone')
        .order('name');
      
      if (error) {
        console.error('Error fetching designers:', error);
        throw error;
      }
      console.log('Designers fetched:', data);
      return data as Designer[];
    },
    enabled: !!user
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['salesmen'],
    queryFn: async () => {
      checkAdminAccess();
      console.log('Fetching salesmen...');
      const { data, error } = await supabase
        .from('salesmen')
        .select('id, name, email, phone')
        .order('name');
      
      if (error) {
        console.error('Error fetching salesmen:', error);
        throw error;
      }
      console.log('Salesmen fetched:', data);
      return data as Salesman[];
    },
    enabled: !!user
  });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      checkAdminAccess();
      console.log('Fetching job titles...');
      const { data, error } = await supabase
        .from('job_titles')
        .select('id, job_title_id')
        .order('job_title_id');
      
      if (error) {
        console.error('Error fetching job titles:', error);
        return [];
      }
      console.log('Job titles fetched:', data);
      return data as JobTitle[];
    },
    enabled: !!user
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      checkAdminAccess();
      console.log('Fetching profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, department, branch, phone')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      console.log('Profiles fetched:', data);
      return data as Profile[];
    },
    enabled: !!user
  });

  // Secure add customer mutation
  const addCustomerMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      checkAdminAccess();
      
      // Input validation and sanitization
      const sanitizedName = sanitizeInput(data.name);
      if (!sanitizedName || sanitizedName.length > 255) {
        throw new Error('Customer name must be between 1 and 255 characters');
      }
      
      console.log('Adding customer:', sanitizedName);
      const { data: result, error } = await supabase
        .from('customers')
        .insert({ name: sanitizedName })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding customer:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCustomerForm({ name: '' });
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive",
      });
    }
  });

  // Secure add designer mutation
  const addDesignerMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      checkAdminAccess();
      
      // Input validation and sanitization
      const sanitizedName = sanitizeInput(data.name);
      const sanitizedPhone = sanitizeInput(data.phone);
      
      if (!sanitizedName || sanitizedName.length > 255) {
        throw new Error('Designer name must be between 1 and 255 characters');
      }
      
      if (sanitizedPhone && !validatePhone(sanitizedPhone)) {
        throw new Error('Invalid phone number format');
      }
      
      console.log('Adding designer:', sanitizedName, sanitizedPhone);
      const { data: result, error } = await supabase
        .from('designers')
        .insert({ name: sanitizedName, phone: sanitizedPhone || null })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding designer:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designers'] });
      setDesignerForm({ name: '', phone: '' });
      toast({
        title: "Success",
        description: "Designer added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding designer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add designer",
        variant: "destructive",
      });
    }
  });

  // Secure add salesman mutation
  const addSalesmanMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string }) => {
      checkAdminAccess();
      
      // Input validation and sanitization
      const sanitizedName = sanitizeInput(data.name);
      const sanitizedEmail = sanitizeInput(data.email);
      const sanitizedPhone = sanitizeInput(data.phone);
      
      if (!sanitizedName || sanitizedName.length > 255) {
        throw new Error('Salesman name must be between 1 and 255 characters');
      }
      
      if (sanitizedEmail && !validateEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }
      
      if (sanitizedPhone && !validatePhone(sanitizedPhone)) {
        throw new Error('Invalid phone number format');
      }
      
      console.log('Adding salesman:', sanitizedName, sanitizedEmail, sanitizedPhone);
      const { data: result, error } = await supabase
        .from('salesmen')
        .insert({ 
          name: sanitizedName, 
          email: sanitizedEmail || null, 
          phone: sanitizedPhone || null 
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding salesman:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
      setSalesmanForm({ name: '', email: '', phone: '' });
      toast({
        title: "Success",
        description: "Salesman added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding salesman:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add salesman",
        variant: "destructive",
      });
    }
  });

  // Secure add job title mutation
  const addJobTitleMutation = useMutation({
    mutationFn: async (data: { job_title_id: string }) => {
      checkAdminAccess();
      
      // Input validation and sanitization
      const sanitizedTitle = sanitizeInput(data.job_title_id);
      if (!sanitizedTitle || sanitizedTitle.length > 255) {
        throw new Error('Job title must be between 1 and 255 characters');
      }
      
      console.log('Adding job title:', sanitizedTitle);
      const { data: result, error } = await supabase
        .from('job_titles')
        .insert({ job_title_id: sanitizedTitle })
        .select()
        .single();

      if (error) {
        console.error('Error adding job title:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
      setJobTitleForm({ title: '' });
      toast({
        title: "Success",
        description: "Job title added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding job title:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add job title",
        variant: "destructive",
      });
    }
  });

  // Secure add user mutation with enhanced validation
  const addUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      fullName: string;
      role: string;
      department: string;
      branch: string;
      phone: string;
    }) => {
      checkAdminAccess();
      
      // Enhanced input validation and sanitization
      const sanitizedEmail = sanitizeInput(userData.email).toLowerCase();
      const sanitizedFullName = sanitizeInput(userData.fullName);
      const sanitizedRole = userData.role.trim();
      const sanitizedDepartment = sanitizeInput(userData.department);
      const sanitizedBranch = sanitizeInput(userData.branch);
      const sanitizedPhone = sanitizeInput(userData.phone);
      
      // Validate email
      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }
      
      // Validate password
      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }
      
      // Validate role
      if (!isValidRole(sanitizedRole)) {
        throw new Error(`Invalid role: ${sanitizedRole}. Must be one of: ${allowedRoles.join(', ')}`);
      }
      
      // Validate phone if provided
      if (sanitizedPhone && !validatePhone(sanitizedPhone)) {
        throw new Error('Invalid phone number format');
      }
      
      // Validate name length
      if (!sanitizedFullName || sanitizedFullName.length > 255) {
        throw new Error('Full name must be between 1 and 255 characters');
      }
      
      console.log('Adding user:', sanitizedEmail);
      
      // Create user via Supabase Auth
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: userData.password,
        options: {
          data: {
            full_name: sanitizedFullName,
          }
        }
      });

      if (signUpError) {
        console.error('Error creating user:', signUpError);
        throw signUpError;
      }

      if (!user?.id) {
        throw new Error('Failed to create user');
      }

      // Add to profiles table with the user ID
      const { data: result, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: sanitizedEmail,
          full_name: sanitizedFullName,
          role: sanitizedRole as Role,
          department: sanitizedDepartment || null,
          branch: sanitizedBranch || null,
          phone: sanitizedPhone || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding profile:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setUserForm({
        email: '',
        password: '',
        fullName: '',
        role: '',
        department: '',
        branch: '',
        phone: ''
      });
      toast({
        title: "Success",
        description: "User added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    }
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
