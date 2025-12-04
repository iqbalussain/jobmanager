-- Drop existing restrictive INSERT policies
DROP POLICY IF EXISTS "Authorized users can create job orders" ON job_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON job_orders;
DROP POLICY IF EXISTS "job_orders_insert_policy" ON job_orders;

-- Create updated INSERT policy that includes manager role
CREATE POLICY "Authorized users can create job orders"
  ON job_orders FOR INSERT
  WITH CHECK (
    (get_current_user_role() = ANY (ARRAY[
      'admin'::app_role, 
      'manager'::app_role,
      'job_order_manager'::app_role, 
      'salesman'::app_role
    ])) 
    AND (created_by = auth.uid())
  );