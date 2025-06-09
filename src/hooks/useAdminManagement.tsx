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

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

export function useAdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      // Use raw SQL query since table might not be in types yet
      const { data, error } = await supabase
        .rpc('exec_sql', { 
          sql: 'SELECT id, job_title_id FROM public.job_titles ORDER BY job_title_id' 
        }) as { data: JobTitle[], error: any };
      
      if (error) {
        console.error('SQL query failed, trying direct access:', error);
        // Fallback to direct table access
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('job_titles' as any)
          .select('id, job_title_id')
          .order('job_title_id');
        
        if (fallbackError) {
          console.error('Error fetching job titles:', fallbackError);
          return [];
        }
        return fallbackData as JobTitle[];
      }
      console.log('Job titles fetched:', data);
      return data;
    }
  });

  const { data: userProfiles = [], isLoading: userProfilesLoading } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      console.log('Fetching user profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role');
      
      if (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
      }
      console.log('User profiles fetched:', data);
      return data as UserProfile[];
    }
  });

  // Add customer mutation
  const customerMutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('Adding customer:', name);
      const { data, error } = await supabase
        .from('customers')
        .insert({ name })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding customer:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
  const designerMutation = useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      console.log('Adding designer:', name, phone);
      const { data, error } = await supabase
        .from('designers')
        .insert({ name, phone })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding designer:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designers'] });
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
  const salesmanMutation = useMutation({
    mutationFn: async ({ name, email, phone }: { name: string; email: string; phone: string }) => {
      console.log('Adding salesman:', name, email, phone);
      const { data, error } = await supabase
        .from('salesmen')
        .insert({ name, email, phone })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding salesman:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
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
    mutationFn: async (title: string) => {
      console.log('Adding job title:', title);
      // Use raw SQL for insert since table might not be in types yet
      const { data, error } = await supabase
        .rpc('exec_sql', {
          sql: `INSERT INTO public.job_titles (job_title_id) VALUES ('${title.replace(/'/g, "''")}') RETURNING *`
        }) as { data: any[], error: any };

      if (error) {
        console.error('SQL insert failed, trying direct access:', error);
        // Fallback to direct table access
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('job_titles' as any)
          .insert({ job_title_id: title })
          .select()
          .single();

        if (fallbackError) {
          throw fallbackError;
        }
        return fallbackData;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-titles'] });
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

  return {
    customers,
    customersLoading,
    designers,
    designersLoading,
    salesmen,
    salesmenLoading,
    jobTitles,
    jobTitlesLoading,
    userProfiles,
    userProfilesLoading,
    addCustomer: customerMutation.mutateAsync,
    addDesigner: designerMutation.mutateAsync,
    addSalesman: salesmanMutation.mutateAsync,
    addJobTitle: addJobTitleMutation.mutateAsync,
    isAdding: customerMutation.isPending || designerMutation.isPending || salesmanMutation.isPending || addJobTitleMutation.isPending
  };
}
