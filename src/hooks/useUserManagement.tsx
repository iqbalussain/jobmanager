
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  department: string | null;
  branch: string | null;
  phone: string | null;
  is_active?: boolean;
}

const allowedRoles = ["admin", "manager", "employee", "designer", "salesman", "job_order_manager"] as const;
type Role = typeof allowedRoles[number];

function isValidRole(role: string): role is Role {
  return allowedRoles.includes(role as Role);
}

export function useUserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: '',
    department: '',
    branch: '',
    phone: ''
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log('Fetching profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, department, branch, phone, is_active')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      console.log('Profiles fetched:', data);
      return data as Profile[];
    }
  });

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
      
      if (!isValidRole(userData.role)) {
        throw new Error(`Invalid role: ${userData.role}. Must be one of: ${allowedRoles.join(', ')}`);
      }
      
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
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

      const { data: result, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role as Role,
          department: userData.department || null,
          branch: userData.branch || null,
          phone: userData.phone || null
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

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.email.trim() && userForm.password.trim() && userForm.fullName.trim()) {
      addUserMutation.mutate(userForm);
    }
  };

  return {
    profiles,
    profilesLoading,
    userForm,
    setUserForm,
    addUserMutation,
    handleAddUser
  };
}
