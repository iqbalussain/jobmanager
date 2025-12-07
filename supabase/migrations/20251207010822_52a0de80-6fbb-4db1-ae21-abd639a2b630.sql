-- Create job_edit_audit table for tracking edits
CREATE TABLE IF NOT EXISTS public.job_edit_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES job_orders(id) ON DELETE CASCADE,
  job_order_number text NOT NULL,
  edited_by uuid NOT NULL,
  edited_by_name text,
  edited_role text,
  diff jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on job_edit_audit
ALTER TABLE public.job_edit_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for job_edit_audit
CREATE POLICY "Users can view audit logs for accessible jobs"
ON public.job_edit_audit
FOR SELECT
USING (
  get_current_user_role() IN ('admin', 'manager', 'job_order_manager')
  OR EXISTS (
    SELECT 1 FROM job_orders jo 
    WHERE jo.id = job_edit_audit.job_id 
    AND (jo.created_by = auth.uid() OR jo.designer_id::text = auth.uid()::text OR jo.salesman_id::text = auth.uid()::text)
  )
);

CREATE POLICY "System can insert audit logs"
ON public.job_edit_audit
FOR INSERT
WITH CHECK (true);

-- Enable realtime for job_edit_audit
ALTER TABLE public.job_edit_audit REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_edit_audit;

-- Create trigger function to log job edits with audit
CREATE OR REPLACE FUNCTION public.log_job_edit_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_fields_json JSONB := '{}'::JSONB;
  field_name TEXT;
  old_val TEXT;
  new_val TEXT;
  editor_name TEXT;
  editor_role TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT full_name, role::text INTO editor_name, editor_role
    FROM profiles WHERE id = auth.uid();
    
    FOR field_name IN 
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'job_orders' 
        AND table_schema = 'public'
        AND column_name NOT IN ('updated_at', 'created_at')
    LOOP
      EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', field_name, field_name) 
        INTO old_val, new_val 
        USING OLD, NEW;
      
      IF old_val IS DISTINCT FROM new_val THEN
        changed_fields_json := jsonb_set(
          changed_fields_json,
          ARRAY[field_name],
          jsonb_build_object('old', old_val, 'new', new_val)
        );
      END IF;
    END LOOP;

    IF changed_fields_json != '{}'::JSONB THEN
      INSERT INTO public.job_edit_audit (
        job_id, job_order_number, edited_by, edited_by_name, edited_role, diff
      ) VALUES (
        NEW.id, NEW.job_order_number, COALESCE(auth.uid(), NEW.created_by),
        editor_name, editor_role, changed_fields_json
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_job_edit_audit ON job_orders;
CREATE TRIGGER trigger_job_edit_audit
  AFTER UPDATE ON job_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_job_edit_audit();

-- Create trigger to prevent updates on invoiced jobs
CREATE OR REPLACE FUNCTION public.prevent_invoiced_job_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'invoiced' THEN
    IF get_current_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Cannot modify invoiced job. Job #% is locked.', OLD.job_order_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_invoiced_update ON job_orders;
CREATE TRIGGER trigger_prevent_invoiced_update
  BEFORE UPDATE ON job_orders
  FOR EACH ROW
  EXECUTE FUNCTION prevent_invoiced_job_update();

-- Create RPC for designer-restricted status updates
CREATE OR REPLACE FUNCTION public.update_job_status(
  p_job_id uuid,
  p_new_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role app_role;
  v_current_status text;
  v_job_order_number text;
  v_allowed_designer_statuses text[] := ARRAY['pending', 'completed', 'out', 'foc_sample', 'finished'];
BEGIN
  SELECT role INTO v_user_role FROM profiles WHERE id = auth.uid();
  
  SELECT status::text, job_order_number INTO v_current_status, v_job_order_number
  FROM job_orders WHERE id = p_job_id;
  
  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Job not found');
  END IF;
  
  IF v_current_status = 'invoiced' AND v_user_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Job is invoiced and locked. Only admins can modify.');
  END IF;
  
  IF v_user_role = 'designer' THEN
    IF NOT (p_new_status = ANY(v_allowed_designer_statuses)) THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Designers can only set status to: pending, completed, out, foc_sample, or finished'
      );
    END IF;
  END IF;
  
  UPDATE job_orders 
  SET status = p_new_status::job_status, updated_at = now()
  WHERE id = p_job_id;
  
  RETURN jsonb_build_object('success', true, 'job_order_number', v_job_order_number);
END;
$$;