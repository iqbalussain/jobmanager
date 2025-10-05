-- Add is_active column to profiles table for user activation/deactivation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Update RLS policies to prevent inactive users from accessing data
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id AND is_active = true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id AND is_active = true);

-- Admin can still manage all profiles including inactive ones
CREATE POLICY "Admin can manage all profiles including inactive"
ON public.profiles
FOR ALL
USING (get_current_user_role() = 'admin'::app_role);

-- Update job orders policies to check user is active
DROP POLICY IF EXISTS "Users can view relevant job orders" ON public.job_orders;
CREATE POLICY "Users can view relevant job orders"
ON public.job_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_active = true
  ) AND (
    (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])) OR
    ((get_current_user_role() = 'designer'::app_role) AND ((designer_id)::text = (auth.uid())::text)) OR
    ((get_current_user_role() = 'salesman'::app_role) AND ((salesman_id)::text = (auth.uid())::text)) OR
    (created_by = auth.uid())
  )
);

-- Create activity log for user status changes
INSERT INTO public.activities (user_id, action, description, entity_type, entity_id)
SELECT 
  auth.uid(),
  'user_status_updated',
  'User activation status updated',
  'profile',
  id
FROM public.profiles
WHERE id = auth.uid()
LIMIT 0; -- This is just to create the schema, won't actually insert