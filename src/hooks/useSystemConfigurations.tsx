import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemConfiguration {
  id: string;
  config_key: string;
  config_value: string;
  config_type: string;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export function useSystemConfigurations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configurations = [], isLoading, error } = useQuery({
    queryKey: ['system-configurations'],
    queryFn: async (): Promise<SystemConfiguration[]> => {
      const { data, error } = await supabase
        .rpc('get_system_configurations');
      
      if (error) throw error;
      return data || [];
    },
  });

  const updateConfigurationMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .rpc('update_system_configuration', {
          config_key: key,
          config_value: value,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-configurations'] });
      toast({
        title: "Configuration Updated",
        description: "System configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update configuration: " + error.message,
        variant: "destructive",
      });
    },
  });

  const getConfigValue = (key: string): string => {
    const config = configurations.find(c => c.config_key === key);
    return config?.config_value || '';
  };

  const getWhatsAppConfig = () => {
    return {
      apiUrl: getConfigValue('whatsapp_api_url'),
      token: getConfigValue('whatsapp_api_token'),
      phoneNumber: getConfigValue('whatsapp_phone_number'),
      enabled: getConfigValue('whatsapp_enabled') === 'true',
    };
  };

  return {
    configurations,
    isLoading,
    error,
    updateConfiguration: updateConfigurationMutation.mutate,
    isUpdating: updateConfigurationMutation.isPending,
    getConfigValue,
    getWhatsAppConfig,
  };
}