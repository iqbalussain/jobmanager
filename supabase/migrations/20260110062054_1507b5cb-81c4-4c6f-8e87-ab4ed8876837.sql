-- Drop all existing job_orders SELECT and INSERT policies to clean up conflicts
DROP POLICY IF EXISTS "Users can view relevant job orders" ON job_orders;
DROP POLICY IF EXISTS "Users can view job orders they created" ON job_orders;
DROP POLICY IF EXISTS "Managers and admins can view all job orders" ON job_orders;
DROP POLICY IF EXISTS "job_orders_select_policy" ON job_orders;
DROP POLICY IF EXISTS "Authorized users can create job orders" ON job_orders;

-- Create a single, clean SELECT policy for job_orders
CREATE POLICY "job_orders_view_policy" ON job_orders
FOR SELECT TO authenticated
USING (
  -- Admins, managers, and job_order_managers can view ALL jobs
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'manager', 'job_order_manager')
  )
  OR
  -- Designers can view jobs assigned to them
  (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'designer'
    )
    AND designer_id = auth.uid()
  )
  OR
  -- Salesmen can view jobs they are assigned to OR jobs they created
  (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'salesman'
    )
    AND (salesman_id = auth.uid() OR created_by = auth.uid())
  )
  OR
  -- Any user can view jobs they created
  created_by = auth.uid()
);

-- Create a clean INSERT policy for job_orders
CREATE POLICY "job_orders_insert_policy" ON job_orders
FOR INSERT TO authenticated
WITH CHECK (
  -- User must have a role that allows creating jobs
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'manager', 'job_order_manager', 'salesman')
  )
  AND
  -- created_by must be the current user
  created_by = auth.uid()
);