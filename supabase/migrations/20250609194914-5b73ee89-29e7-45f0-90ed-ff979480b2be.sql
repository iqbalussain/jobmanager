
-- Remove job_order_manager from policies and replace with role-based logic
DROP POLICY IF EXISTS "Users can view relevant job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Authorized users can create job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Authorized users can update job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Users can view attachments for accessible job orders" ON public.job_order_attachments;
DROP POLICY IF EXISTS "Users can add attachments to accessible job orders" ON public.job_order_attachments;
DROP POLICY IF EXISTS "Users can view comments for accessible job orders" ON public.job_order_comments;
DROP POLICY IF EXISTS "Users can add comments to accessible job orders" ON public.job_order_comments;

-- Recreate policies without job_order_manager
CREATE POLICY "Users can view relevant job orders" 
  ON public.job_orders 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager') OR
    (public.get_current_user_role() = 'designer' AND designer_id::text = auth.uid()::text) OR
    (public.get_current_user_role() = 'salesman' AND salesman_id::text = auth.uid()::text) OR
    created_by = auth.uid()
  );

CREATE POLICY "Authorized users can create job orders" 
  ON public.job_orders 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'manager', 'salesman') AND
    created_by = auth.uid()
  );

CREATE POLICY "Authorized users can update job orders" 
  ON public.job_orders 
  FOR UPDATE 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager') OR
    created_by = auth.uid()
  );

-- Recreate policies for attachments table
CREATE POLICY "Users can view attachments for accessible job orders" 
  ON public.job_order_attachments 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.job_orders jo 
      WHERE jo.id = job_order_id 
      AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        (public.get_current_user_role() = 'designer' AND jo.designer_id::text = auth.uid()::text) OR
        (public.get_current_user_role() = 'salesman' AND jo.salesman_id::text = auth.uid()::text) OR
        jo.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add attachments to accessible job orders" 
  ON public.job_order_attachments 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_orders jo 
      WHERE jo.id = job_order_id 
      AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        jo.created_by = auth.uid()
      )
    )
  );

-- Recreate policies for comments table
CREATE POLICY "Users can view comments for accessible job orders" 
  ON public.job_order_comments 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.job_orders jo 
      WHERE jo.id = job_order_id 
      AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        (public.get_current_user_role() = 'designer' AND jo.designer_id::text = auth.uid()::text) OR
        (public.get_current_user_role() = 'salesman' AND jo.salesman_id::text = auth.uid()::text) OR
        jo.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add comments to accessible job orders" 
  ON public.job_order_comments 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_orders jo 
      WHERE jo.id = job_order_id 
      AND (
        public.get_current_user_role() IN ('admin', 'manager') OR
        jo.created_by = auth.uid()
      )
    )
  );

-- Update other table policies to remove job_order_manager references
DROP POLICY IF EXISTS "Admin and managers can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Admin and managers can view all salesmen" ON public.salesmen;
DROP POLICY IF EXISTS "Admin and managers can view all designers" ON public.designers;

CREATE POLICY "Admin and managers can view all customers" 
  ON public.customers 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager', 'salesman')
  );

CREATE POLICY "Admin and managers can view all salesmen" 
  ON public.salesmen 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "Admin and managers can view all designers" 
  ON public.designers 
  FOR SELECT 
  TO authenticated 
  USING (
    public.get_current_user_role() IN ('admin', 'manager')
  );
