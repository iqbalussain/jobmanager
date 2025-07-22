import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Save, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';
import { Textarea } from '@/components/ui/textarea';

export function WhatsAppConfigSection() {
  const { configurations, isLoading, updateConfiguration, isUpdating, getWhatsAppConfig } = useSystemConfigurations();
  const [config, setConfig] = useState({
    apiUrl: '',
    token: '',
    phoneNumber: '',
    enabled: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const whatsAppConfig = getWhatsAppConfig();
      setConfig(whatsAppConfig);
    }
  }, [configurations, isLoading, getWhatsAppConfig]);

  const handleConfigChange = (key: string, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateConfiguration({ key: 'whatsapp_api_url', value: config.apiUrl });
    await updateConfiguration({ key: 'whatsapp_api_token', value: config.token });
    await updateConfiguration({ key: 'whatsapp_phone_number', value: config.phoneNumber });
    await updateConfiguration({ key: 'whatsapp_enabled', value: config.enabled.toString() });
    setHasChanges(false);
  };

  const testConnection = async () => {
    // Placeholder for testing WhatsApp API connection
    console.log('Testing WhatsApp connection with config:', config);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading WhatsApp configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">WhatsApp API Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure WhatsApp API settings for sending notifications
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {config.enabled ? (
            <Badge className="bg-green-500/10 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Enabled
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-700 border-red-200">
              <XCircle className="w-3 h-3 mr-1" />
              Disabled
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-url">API Base URL</Label>
              <Input
                id="whatsapp-url"
                value={config.apiUrl}
                onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
                placeholder="https://api.whatsapp.com/v1"
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp-token">API Token</Label>
              <Input
                id="whatsapp-token"
                type="password"
                value={config.token}
                onChange={(e) => handleConfigChange('token', e.target.value)}
                placeholder="Enter your WhatsApp API token"
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp-phone">Business Phone Number</Label>
              <Input
                id="whatsapp-phone"
                value={config.phoneNumber}
                onChange={(e) => handleConfigChange('phoneNumber', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="whatsapp-enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
              />
              <Label htmlFor="whatsapp-enabled">Enable WhatsApp Notifications</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || isUpdating}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Configuration'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={testConnection}
                disabled={!config.enabled || !config.apiUrl || !config.token}
                className="w-full"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
            </div>

            {hasChanges && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  You have unsaved changes. Don't forget to save your configuration.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-4">
              To set up WhatsApp integration, follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Create a WhatsApp Business Account and get API access</li>
              <li>Obtain your API token and base URL from your WhatsApp provider</li>
              <li>Enter your business phone number (must be verified with WhatsApp)</li>
              <li>Test the connection to ensure everything is working</li>
              <li>Enable WhatsApp notifications to start sending messages</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}