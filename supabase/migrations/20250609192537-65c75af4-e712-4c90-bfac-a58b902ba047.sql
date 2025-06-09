
-- First, drop the foreign key constraint explicitly
ALTER TABLE public.job_orders DROP CONSTRAINT IF EXISTS job_orders_assignee_id_fkey;

-- Drop ALL existing policies that might conflict
DROP POLICY IF EXISTS "Users can view job orders they're involved in" ON public.job_orders;
DROP POLICY IF EXISTS "Users can view relevant job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Authorized users can create job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Users can view attachments for accessible job orders" ON public.job_order_attachments;
DROP POLICY IF EXISTS "Users can add attachments to accessible job orders" ON public.job_order_attachments;
DROP POLICY IF EXISTS "Users can view comments for accessible job orders" ON public.job_order_comments;
DROP POLICY IF EXISTS "Users can add comments to accessible job orders" ON public.job_order_comments;

-- Change assignee_id column from UUID to text
ALTER TABLE public.job_orders 
  ALTER COLUMN assignee_id SET DATA TYPE text USING assignee_id::text;

-- Rename the column from assignee_id to assignee
ALTER TABLE public.job_orders 
  RENAME COLUMN assignee_id TO assignee;

-- Recreate all the policies with the new column name
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
        public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager') OR
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
        public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager') OR
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
        public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager') OR
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
        public.get_current_user_role() IN ('admin', 'manager', 'job_order_manager') OR
        jo.created_by = auth.uid()
      )
    )
  );
