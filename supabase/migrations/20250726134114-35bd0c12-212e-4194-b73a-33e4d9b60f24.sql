
-- Create functions for email recipients management
CREATE OR REPLACE FUNCTION public.get_email_recipients()
RETURNS TABLE (
  id UUID,
  email_address TEXT,
  name TEXT,
  category TEXT,
  is_active BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    e.id,
    e.email_address,
    e.name,
    e.category,
    e.is_active,
    e.created_by,
    e.created_at,
    e.updated_at
  FROM public.email_recipients e
  ORDER BY e.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.add_email_recipient(
  email_address TEXT,
  name TEXT DEFAULT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.email_recipients (email_address, name, category, is_active, created_by)
  VALUES (email_address, name, category, is_active, auth.uid())
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_email_recipient(
  recipient_id UUID,
  updates JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.email_recipients
  SET 
    email_address = COALESCE((updates->>'email_address')::TEXT, email_address),
    name = COALESCE((updates->>'name')::TEXT, name),
    category = COALESCE((updates->>'category')::TEXT, category),
    is_active = COALESCE((updates->>'is_active')::BOOLEAN, is_active),
    updated_at = NOW()
  WHERE id = recipient_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email_recipient(
  recipient_id UUID
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  DELETE FROM public.email_recipients WHERE id = recipient_id;
$$;

-- Create functions for email logs
CREATE OR REPLACE FUNCTION public.get_email_logs()
RETURNS TABLE (
  id UUID,
  recipient_email TEXT,
  subject TEXT,
  content TEXT,
  email_type TEXT,
  job_order_id UUID,
  sent_at TIMESTAMPTZ,
  sent_by UUID,
  status TEXT,
  error_message TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    e.id,
    e.recipient_email,
    e.subject,
    e.content,
    e.email_type,
    e.job_order_id,
    e.sent_at,
    e.sent_by,
    e.status,
    e.error_message
  FROM public.email_logs e
  ORDER BY e.sent_at DESC;
$$;

-- Create functions for system configurations
CREATE OR REPLACE FUNCTION public.get_system_configurations()
RETURNS TABLE (
  id UUID,
  config_key TEXT,
  config_value TEXT,
  config_type TEXT,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.config_key,
    s.config_value,
    s.config_type,
    s.description,
    s.updated_by,
    s.updated_at,
    s.created_at
  FROM public.system_configurations s
  ORDER BY s.config_key;
$$;

CREATE OR REPLACE FUNCTION public.update_system_configuration(
  config_key TEXT,
  config_value TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.system_configurations
  SET 
    config_value = update_system_configuration.config_value,
    updated_by = auth.uid(),
    updated_at = NOW()
  WHERE system_configurations.config_key = update_system_configuration.config_key;
END;
$$;

-- Create functions for user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(
  user_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  permission_id TEXT,
  granted_by UUID,
  granted_at TIMESTAMPTZ,
  is_active BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.permission_id,
    p.granted_by,
    p.granted_at,
    p.is_active
  FROM public.user_permissions p
  WHERE p.user_id = get_user_permissions.user_id
    AND p.is_active = TRUE;
$$;

CREATE OR REPLACE FUNCTION public.grant_user_permission(
  user_id UUID,
  permission_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_permissions (user_id, permission_id, granted_by, is_active)
  VALUES (user_id, permission_id, auth.uid(), TRUE)
  ON CONFLICT (user_id, permission_id) 
  DO UPDATE SET 
    is_active = TRUE,
    granted_by = auth.uid(),
    granted_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_user_permission(
  user_id UUID,
  permission_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_permissions
  SET is_active = FALSE
  WHERE user_permissions.user_id = revoke_user_permission.user_id
    AND user_permissions.permission_id = revoke_user_permission.permission_id;
END;
$$;
