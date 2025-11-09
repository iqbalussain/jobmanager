-- Archive quotations and create employee_advances table
BEGIN;

-- 1. Archive existing quotations table (preserve data)
CREATE TABLE IF NOT EXISTS quotations_archive AS 
SELECT * FROM quotations;

-- 2. Archive quotation_items
CREATE TABLE IF NOT EXISTS quotation_items_archive AS 
SELECT * FROM quotation_items;

-- 3. Mark original tables as deprecated (keep for safety)
ALTER TABLE quotations RENAME TO quotations_deprecated;
ALTER TABLE quotation_items RENAME TO quotation_items_deprecated;

-- 4. Create employee_advances table (if not exists)
CREATE TABLE IF NOT EXISTS employee_advances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'OMR',
  status text DEFAULT 'open' CHECK (status IN ('open', 'settled', 'cancelled')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_employee_advances_employee_id ON employee_advances(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_advances_status ON employee_advances(status);

-- 5. RLS policies for employee_advances
ALTER TABLE employee_advances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage employee advances"
  ON employee_advances FOR ALL
  USING (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Employees can view own advances"
  ON employee_advances FOR SELECT
  USING (employee_id = auth.uid());

-- 6. Add trigger for updated_at
CREATE TRIGGER update_employee_advances_updated_at
  BEFORE UPDATE ON employee_advances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;