-- Allow all authenticated users to view profiles with designer or salesman roles
-- This is needed for dropdown lists when creating job orders
CREATE POLICY "Authenticated users can view designer and salesman profiles"
ON profiles
FOR SELECT TO authenticated
USING (
  -- Allow viewing profiles that have designer or salesman role (for dropdowns)
  role IN ('designer', 'salesman')
  OR
  -- Users can still view their own profile
  id = auth.uid()
  OR
  -- Admins and managers can view all
  get_current_user_role() IN ('admin', 'manager')
);