
-- 1. Fix unrestricted INSERT policies: restrict to authenticated role

-- notifications
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- activities
DROP POLICY IF EXISTS "System can insert activities" ON activities;
CREATE POLICY "System can insert activities" ON activities
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- job_edit_audit
DROP POLICY IF EXISTS "System can insert audit logs" ON job_edit_audit;
CREATE POLICY "System can insert audit logs" ON job_edit_audit
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- daily_checklists
DROP POLICY IF EXISTS "System can insert checklists" ON daily_checklists;
CREATE POLICY "System can insert checklists" ON daily_checklists
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- job_order_logs
DROP POLICY IF EXISTS "System can insert job order logs" ON job_order_logs;
CREATE POLICY "System can insert job order logs" ON job_order_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 2. Fix broken customer admin check policies (missing auth.uid() filter)
DROP POLICY IF EXISTS "Admin can delete customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;

-- 3. Add SELECT policy for non-admin users on job_order_logs
CREATE POLICY "Users can view logs for accessible jobs" ON job_order_logs
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'job_order_manager'::app_role)
    OR EXISTS (
      SELECT 1 FROM job_orders jo
      WHERE jo.id = job_order_logs.job_order_id
      AND (
        jo.created_by = auth.uid()
        OR jo.designer_id = auth.uid()
        OR jo.salesman_id = auth.uid()
      )
    )
  );

-- Drop the old admin-only SELECT policy since the new one covers admins too
DROP POLICY IF EXISTS "Admins can view all job order logs" ON job_order_logs;
