
-- Create user_permissions table for granular permission management
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- Create email_recipients table
CREATE TABLE public.email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_address TEXT NOT NULL UNIQUE,
  name TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_logs table
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  email_type TEXT NOT NULL DEFAULT 'notification',
  job_order_id UUID REFERENCES public.job_orders(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_configurations table
CREATE TABLE public.system_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  config_type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_permissions
CREATE POLICY "Admin can manage all user permissions" ON public.user_permissions
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for email_recipients
CREATE POLICY "Admin can manage email recipients" ON public.email_recipients
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Managers can view email recipients" ON public.email_recipients
  FOR SELECT USING (get_current_user_role() = ANY(ARRAY['admin', 'manager']));

-- RLS policies for email_logs
CREATE POLICY "Admin can view all email logs" ON public.email_logs
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert email logs" ON public.email_logs
  FOR INSERT WITH CHECK (true);

-- RLS policies for system_configurations
CREATE POLICY "Admin can manage system configurations" ON public.system_configurations
  FOR ALL USING (get_current_user_role() = 'admin');

-- Insert default email recipients
INSERT INTO public.email_recipients (email_address, name, category, is_active) VALUES
  ('aqeeb@printwavesoman.com', 'Aqeeb', 'approvals', true),
  ('account@printwavesoman.com', 'Account Department', 'approvals', true);

-- Insert default WhatsApp configuration
INSERT INTO public.system_configurations (config_key, config_value, config_type, description) VALUES
  ('whatsapp_api_url', '', 'text', 'WhatsApp API base URL'),
  ('whatsapp_api_token', '', 'password', 'WhatsApp API authentication token'),
  ('whatsapp_phone_number', '', 'text', 'WhatsApp business phone number'),
  ('whatsapp_enabled', 'false', 'boolean', 'Enable WhatsApp notifications');

-- Create indexes for better performance
CREATE INDEX idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_id ON public.user_permissions(permission_id);
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_job_order ON public.email_logs(job_order_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX idx_system_configurations_key ON public.system_configurations(config_key);
