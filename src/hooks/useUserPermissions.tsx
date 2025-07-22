import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  granted_by: string | null;
  granted_at: string;
  is_active: boolean;
}

export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Define available permissions
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { id: 'view_all_jobs', name: 'View All Jobs', description: 'Can view all job orders', category: 'Jobs' },
  { id: 'create_jobs', name: 'Create Jobs', description: 'Can create new job orders', category: 'Jobs' },
  { id: 'edit_all_jobs', name: 'Edit All Jobs', description: 'Can edit any job order', category: 'Jobs' },
  { id: 'approve_jobs', name: 'Approve Jobs', description: 'Can approve job orders', category: 'Jobs' },
  { id: 'delete_jobs', name: 'Delete Jobs', description: 'Can delete job orders', category: 'Jobs' },
  { id: 'manage_users', name: 'Manage Users', description: 'Can manage user accounts', category: 'Admin' },
  { id: 'manage_customers', name: 'Manage Customers', description: 'Can manage customer data', category: 'Admin' },
  { id: 'view_reports', name: 'View Reports', description: 'Can access reports and analytics', category: 'Reports' },
  { id: 'manage_settings', name: 'Manage Settings', description: 'Can change system settings', category: 'Admin' },
  { id: 'send_notifications', name: 'Send Notifications', description: 'Can send email/WhatsApp notifications', category: 'Communications' },
];

export function useUserPermissions(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async (): Promise<UserPermission[]> => {
      const { data, error } = await supabase
        .rpc('get_user_permissions', { user_id: userId });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const grantPermissionMutation = useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      const { error } = await supabase
        .rpc('grant_user_permission', {
          user_id: userId,
          permission_id: permissionId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({
        title: "Permission Granted",
        description: "User permission has been successfully granted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to grant permission: " + error.message,
        variant: "destructive",
      });
    },
  });

  const revokePermissionMutation = useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      const { error } = await supabase
        .rpc('revoke_user_permission', {
          user_id: userId,
          permission_id: permissionId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({
        title: "Permission Revoked",
        description: "User permission has been successfully revoked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to revoke permission: " + error.message,
        variant: "destructive",
      });
    },
  });

  const hasPermission = (permissionId: string): boolean => {
    return permissions.some(p => p.permission_id === permissionId && p.is_active);
  };

  return {
    permissions,
    isLoading,
    error,
    grantPermission: grantPermissionMutation.mutate,
    revokePermission: revokePermissionMutation.mutate,
    isGranting: grantPermissionMutation.isPending,
    isRevoking: revokePermissionMutation.isPending,
    hasPermission,
  };
}