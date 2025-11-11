-- Create job_order_logs table for immutable audit trail
CREATE TABLE IF NOT EXISTS public.job_order_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_order_id UUID NOT NULL REFERENCES public.job_orders(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated')),
  changed_fields JSONB,
  snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_order_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all logs
CREATE POLICY "Admins can view all job order logs"
  ON public.job_order_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- System can insert logs (through trigger)
CREATE POLICY "System can insert job order logs"
  ON public.job_order_logs FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_job_order_logs_job_order_id ON public.job_order_logs(job_order_id);
CREATE INDEX idx_job_order_logs_changed_at ON public.job_order_logs(changed_at DESC);

-- Function to log job order changes
CREATE OR REPLACE FUNCTION public.log_job_order_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_fields_json JSONB := '{}'::JSONB;
  field_name TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- On INSERT, log creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.job_order_logs (
      job_order_id,
      changed_by,
      action,
      snapshot
    ) VALUES (
      NEW.id,
      NEW.created_by,
      'created',
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;

  -- On UPDATE, log changes
  IF TG_OP = 'UPDATE' THEN
    -- Compare each field and build changed_fields JSON
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

    -- Only log if there are actual changes
    IF changed_fields_json != '{}'::JSONB THEN
      INSERT INTO public.job_order_logs (
        job_order_id,
        changed_by,
        action,
        changed_fields,
        snapshot
      ) VALUES (
        NEW.id,
        COALESCE(auth.uid(), NEW.created_by),
        'updated',
        changed_fields_json,
        to_jsonb(NEW)
      );
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Create trigger for job_orders changes
DROP TRIGGER IF EXISTS job_order_changes_trigger ON public.job_orders;
CREATE TRIGGER job_order_changes_trigger
  AFTER INSERT OR UPDATE ON public.job_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_job_order_changes();