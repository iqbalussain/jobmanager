-- Fix 1: Restrict activities table access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all activities" ON activities;

-- Create a properly scoped policy
CREATE POLICY "Users can view relevant activities"
  ON activities FOR SELECT
  USING (
    user_id = auth.uid() OR
    get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role]) OR
    EXISTS (
      SELECT 1 FROM job_orders jo
      WHERE jo.id = activities.entity_id::uuid
      AND activities.entity_type = 'job_order'
      AND (
        jo.created_by = auth.uid() OR
        jo.salesman_id::text = auth.uid()::text OR
        jo.designer_id::text = auth.uid()::text
      )
    )
  );

-- Fix 2: Add search_path to all SECURITY DEFINER functions
-- Update has_role function (use CREATE OR REPLACE to avoid dependency issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'employee'::public.app_role
  );
  
  -- Add default employee role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee'::public.app_role);
  
  RETURN NEW;
END;
$$;