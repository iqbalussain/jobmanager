-- Drop obsolete quotation conversion function since quotations were removed
DROP FUNCTION IF EXISTS public.convert_quotation_to_job_order(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.generate_quotation_number() CASCADE;

-- Add search_path to remaining functions for consistency
CREATE OR REPLACE FUNCTION public.generate_job_order_number(branch text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
declare
  prefix text;
  new_number int;
  new_job_order_number text;
begin
  if branch = 'Wadi Kabeer' then
    prefix := 'WK';
  elsif branch = 'Wajihath' then
    prefix := 'WJ';
  else
    prefix := 'HO';
  end if;

  select
    coalesce(max(cast(substring(job_order_number from 3) as int)), 10000) + 1
  into new_number
  from job_orders
  where job_order_number like prefix || '%';

  new_job_order_number := prefix || new_number;

  return new_job_order_number;
end;
$$;

CREATE OR REPLACE FUNCTION public.log_job_order_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (user_id, action, description, entity_type, entity_id)
    VALUES (
      NEW.created_by,
      'created',
      'Created job order ' || NEW.job_order_number,
      'job_order',
      NEW.id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      INSERT INTO public.activities (user_id, action, description, entity_type, entity_id)
      VALUES (
        COALESCE(auth.uid(), NEW.created_by),
        'status_updated',
        'Updated job order ' || NEW.job_order_number || ' status to ' || NEW.status,
        'job_order',
        NEW.id
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_quotation_total()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.quotations_deprecated 
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0) 
    FROM public.quotation_items_deprecated 
    WHERE quotation_id = COALESCE(NEW.quotation_id, OLD.quotation_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.quotation_id, OLD.quotation_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;