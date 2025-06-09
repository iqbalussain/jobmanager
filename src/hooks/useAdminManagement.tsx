import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

// Define allowed roles and validation
const allowedRoles = ["admin", "manager", "employee", "designer", "salesman", "job_order_manager"] as const;
type Role = typeof allowedRoles[number];

function isValidRole(role: string): role is Role {
  return allowedRoles.includes(role as Role);
}

export function useAdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
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

  // Data queries
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
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
    }
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
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
    }
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['salesmen'],
    queryFn: async () => {
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
    }
  });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
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
    }
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
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
    }
  });

  // Add customer mutation
  const addCustomerMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      console.log('Adding customer:', data.name);
      const { data: result, error } = await supabase
        .from('customers')
        .insert({ name: data.name })
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
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
  });

  // Add designer mutation
  const addDesignerMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      console.log('Adding designer:', data.name, data.phone);
      const { data: result, error } = await supabase
        .from('designers')
        .insert({ name: data.name, phone: data.phone || null })
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
        description: "Failed to add designer",
        variant: "destructive",
      });
    }
  });

  // Add salesman mutation
  const addSalesmanMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string }) => {
      console.log('Adding salesman:', data.name, data.email, data.phone);
      const { data: result, error } = await supabase
        .from('salesmen')
        .insert({ 
          name: data.name, 
          email: data.email || null, 
          phone: data.phone || null 
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
        description: "Failed to add salesman",
        variant: "destructive",
      });
    }
  });

  // Add job title mutation
  const addJobTitleMutation = useMutation({
    mutationFn: async (data: { job_title_id: string }) => {
      console.log('Adding job title:', data.job_title_id);
      const { data: result, error } = await supabase
        .from('job_titles')
        .insert({ job_title_id: data.job_title_id })
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
        description: "Failed to add job title",
        variant: "destructive",
      });
    }
  });

  // Add user mutation
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
      console.log('Adding user:', userData.email);
      
      // Validate role before inserting
      if (!isValidRole(userData.role)) {
        throw new Error(`Invalid role: ${userData.role}. Must be one of: ${allowedRoles.join(', ')}`);
      }
      
      // For now, we'll just add to profiles table
      // In a real app, you'd want to create the auth user first
      const { data: result, error } = await supabase
        .from('profiles')
        .insert({
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role as Role, // Now safely typed
          department: userData.department || null,
          branch: userData.branch || null,
          phone: userData.phone || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding user:', error);
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
    addUserMutation
  };
}
