import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Users, Settings } from 'lucide-react';
import { EmailRecipientsSection } from './communications/EmailRecipientsSection';
import { EmailLogsSection } from './communications/EmailLogsSection';
import { WhatsAppConfigSection } from './communications/WhatsAppConfigSection';

export function CommunicationsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications Management</h1>
          <p className="text-muted-foreground">
            Manage email recipients, view communication logs, and configure messaging APIs
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Settings className="w-4 h-4 mr-1" />
          Admin Panel
        </Badge>
      </div>

      <Tabs defaultValue="recipients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recipients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Email Recipients
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Logs
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            WhatsApp Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Email Recipients Management
              </CardTitle>
              <CardDescription>
                Add, remove, and manage email addresses for notifications and communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailRecipientsSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Communication Logs
              </CardTitle>
              <CardDescription>
                View history of all emails sent through the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailLogsSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                WhatsApp API Configuration
              </CardTitle>
              <CardDescription>
                Configure WhatsApp API settings for notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WhatsAppConfigSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}