
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  email: string;
  full_name: string | null;
  role: string;
  department: string | null;
  branch: string | null;
  phone: string | null;
}

export function useAdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [customerForm, setCustomerForm] = useState({ name: "" });
  const [designerForm, setDesignerForm] = useState({ name: "", phone: "" });
  const [salesmanForm, setSalesmanForm] = useState({ name: "", email: "", phone: "" });
  const [jobTitleForm, setJobTitleForm] = useState({ title: "" });
  const [userForm, setUserForm] = useState({ 
    email: "", 
    password: "", 
    fullName: "", 
    role: "employee", 
    department: "", 
    branch: "", 
    phone: "" 
  });

  // Fetch data queries
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Customer[];
    }
  });

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['admin-designers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Designer[];
    }
  });

  const { data: salesmen = [], isLoading: salesmenLoading } = useQuery({
    queryKey: ['admin-salesmen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salesmen')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Salesman[];
    }
  });

  const { data: jobTitles = [], isLoading: jobTitlesLoading } = useQuery({
    queryKey: ['admin-job-titles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_titles')
        .select('*')
        .order('job_title_id');
      if (error) throw error;
      return data as JobTitle[];
    }
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Mutations
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: { name: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCustomerForm({ name: "" });
      toast({ title: "Customer added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding customer", description: error.message, variant: "destructive" });
    }
  });

  const addDesignerMutation = useMutation({
    mutationFn: async (designerData: { name: string; phone: string }) => {
      const { data, error } = await supabase
        .from('designers')
        .insert([designerData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-designers'] });
      queryClient.invalidateQueries({ queryKey: ['designers'] });
      setDesignerForm({ name: "", phone: "" });
      toast({ title: "Designer added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding designer", description: error.message, variant: "destructive" });
    }
  });

  const addSalesmanMutation = useMutation({
    mutationFn: async (salesmanData: { name: string; email: string; phone: string }) => {
      const { data, error } = await supabase
        .from('salesmen')
        .insert([salesmanData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salesmen'] });
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
      setSalesmanForm({ name: "", email: "", phone: "" });
      toast({ title: "Salesman added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding salesman", description: error.message, variant: "destructive" });
    }
  });

  const addJobTitleMutation = useMutation({
    mutationFn: async (jobTitleData: { job_title_id: string }) => {
      const { data, error } = await supabase
        .from('job_titles')
        .insert([jobTitleData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-job-titles'] });
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
      setJobTitleForm({ title: "" });
      toast({ title: "Job title added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding job title", description: error.message, variant: "destructive" });
    }
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: userData.email,
            full_name: userData.fullName,
            role: userData.role,
            department: userData.department || null,
            branch: userData.branch || null,
            phone: userData.phone || null
          }]);
        
        if (profileError) throw profileError;

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: authData.user.id,
            role: userData.role
          }]);
        
        if (roleError) throw roleError;
      }
      
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      setUserForm({ 
        email: "", 
        password: "", 
        fullName: "", 
        role: "employee", 
        department: "", 
        branch: "", 
        phone: "" 
      });
      toast({ title: "User added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding user", description: error.message, variant: "destructive" });
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
