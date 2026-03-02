
DROP POLICY "job_orders_insert_policy" ON job_orders;
CREATE POLICY "job_orders_insert_policy" ON job_orders
  FOR INSERT WITH CHECK (
    (EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin','manager','job_order_manager','salesman','designer')
    ))
    AND created_by = auth.uid()
  );
