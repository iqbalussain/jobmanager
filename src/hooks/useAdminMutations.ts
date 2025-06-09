
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, validateEmail, validatePhone, validatePassword } from '@/utils/adminValidation';
import { isValidRole, type Role } from '@/utils/roleValidation';

export function useAdminMutations(checkAdminAccess: () => boolean) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Updated salesman mutation to work with profiles table
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
      
      console.log('Adding salesman to profiles:', sanitizedName, sanitizedEmail, sanitizedPhone);
      // Note: In a real implementation, you would create a new user account first
      // and then update their profile. For now, this is just a placeholder.
      throw new Error('Adding salesmen requires proper user account creation flow');
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
        description: error.message || "Failed to add salesman. Please contact an administrator.",
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
        throw new Error(`Invalid role: ${sanitizedRole}. Must be one of: admin, manager, employee, designer, salesman, job_order_manager`);
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
    addCustomerMutation,
    addDesignerMutation,
    addSalesmanMutation,
    addJobTitleMutation,
    addUserMutation
  };
}
