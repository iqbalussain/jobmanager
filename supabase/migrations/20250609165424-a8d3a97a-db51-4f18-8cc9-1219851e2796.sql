
-- Drop existing basic policies to replace with role-based ones
DROP POLICY IF EXISTS "Allow authenticated users to view customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated users to create customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated users to view salesmen" ON public.salesmen;
DROP POLICY IF EXISTS "Allow authenticated users to create salesmen" ON public.salesmen;
DROP POLICY IF EXISTS "Allow authenticated users to view designers" ON public.designers;
DROP POLICY IF EXISTS "Allow authenticated users to create designers" ON public.designers;
DROP POLICY IF EXISTS "Allow authenticated users to view job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Allow authenticated users to create job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Allow authenticated users to update job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Allow authenticated users to view job titles" ON public.job_titles;
DROP POLICY IF EXISTS "Allow authenticated users to create job titles" ON public.job_titles;

-- Create security definer function to get user role (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Customers table policies
CREATE POLICY "Admin and managers can view all customers" 
  ON public.customers 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager', 'salesman', 'job_order_manager')
  );

CREATE POLICY "Admin and managers can create customers" 
  ON public.customers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager', 'salesman')
  );

CREATE POLICY "Admin and managers can update customers" 
  ON public.customers 
  FOR UPDATE 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admin can delete customers" 
  ON public.customers 
  FOR DELETE 
  TO authenticated 
  USING (
    public.get_current_user_role() = 'admin'
  );

-- Salesmen table policies
CREATE POLICY "Admin and managers can view all salesmen" 
  ON public.salesmen 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager')
  );

CREATE POLICY "Admin and managers can create salesmen" 
  ON public.salesmen 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admin and managers can update salesmen" 
  ON public.salesmen 
  FOR UPDATE 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admin can delete salesmen" 
  ON public.salesmen 
  FOR DELETE 
  TO authenticated 
  USING (
    public.get_current_user_role() = 'admin'
  );

-- Designers table policies
CREATE POLICY "Admin and managers can view all designers" 
  ON public.designers 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager')
  );

CREATE POLICY "Admin and managers can create designers" 
  ON public.designers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admin and managers can update designers" 
  ON public.designers 
  FOR UPDATE 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admin can delete designers" 
  ON public.designers 
  FOR DELETE 
  TO authenticated 
  USING (
    public.get_current_user_role() = 'admin'
  );

-- Job orders table policies
CREATE POLICY "Users can view relevant job orders" 
  ON public.job_orders 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager') OR
    (public.get_current_user_role() = 'designer' AND designer_id::text = auth.uid()::text) OR
    (public.get_current_user_role() = 'salesman' AND salesman_id::text = auth.uid()::text) OR
    created_by = auth.uid()
  );

CREATE POLICY "Authorized users can create job orders" 
  ON public.job_orders 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager', 'salesman') AND
    created_by = auth.uid()
  );

CREATE POLICY "Authorized users can update job orders" 
  ON public.job_orders 
  FOR UPDATE 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager') OR
    created_by = auth.uid()
  );

CREATE POLICY "Admin and managers can delete job orders" 
  ON public.job_orders 
  FOR DELETE 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
  );

-- Job titles table policies
CREATE POLICY "All authenticated users can view job titles" 
  ON public.job_titles 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Admin and managers can create job titles" 
  ON public.job_titles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admin and managers can update job titles" 
  ON public.job_titles 
  FOR UPDATE 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admin can delete job titles" 
  ON public.job_titles 
  FOR DELETE 
  TO authenticated 
  USING (
    public.get_current_user_role() = 'admin'
  );

-- Profiles table policies (fix for existing issues)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

CREATE POLICY "Users can view own profile and admins can view all" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    id = auth.uid() OR 
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Users can update own profile and admins can update all" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (
    id = auth.uid() OR 
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admin can delete profiles" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated 
  USING (
    public.get_current_user_role() = 'admin'
  );
