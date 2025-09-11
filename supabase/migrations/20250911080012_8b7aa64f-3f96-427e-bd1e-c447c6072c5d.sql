-- Create enum for quotation status
CREATE TYPE quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'converted');

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL,
  salesman_id UUID NOT NULL,
  status quotation_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(10,2) DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_to_job_order_id UUID NULL,
  notes TEXT
);

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL,
  job_title_id UUID NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  order_sequence INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotations
CREATE POLICY "Users can view relevant quotations" 
ON public.quotations 
FOR SELECT 
USING (
  (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])) OR
  ((get_current_user_role() = 'salesman'::app_role) AND (salesman_id::text = auth.uid()::text)) OR
  (created_by = auth.uid())
);

CREATE POLICY "Authorized users can create quotations" 
ON public.quotations 
FOR INSERT 
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role, 'salesman'::app_role])) AND
  (created_by = auth.uid())
);

CREATE POLICY "Authorized users can update quotations" 
ON public.quotations 
FOR UPDATE 
USING (
  (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])) OR
  ((get_current_user_role() = 'salesman'::app_role) AND (created_by = auth.uid()))
);

CREATE POLICY "Admins can delete quotations" 
ON public.quotations 
FOR DELETE 
USING (get_current_user_role() = 'admin'::app_role);

-- RLS Policies for quotation_items
CREATE POLICY "Users can view quotation items for accessible quotations" 
ON public.quotation_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.quotations q 
    WHERE q.id = quotation_items.quotation_id AND (
      (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])) OR
      ((get_current_user_role() = 'salesman'::app_role) AND (q.salesman_id::text = auth.uid()::text)) OR
      (q.created_by = auth.uid())
    )
  )
);

CREATE POLICY "Users can manage quotation items for accessible quotations" 
ON public.quotation_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.quotations q 
    WHERE q.id = quotation_items.quotation_id AND (
      (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])) OR
      ((get_current_user_role() = 'salesman'::app_role) AND (q.created_by = auth.uid()))
    )
  )
);

-- Function to generate quotation numbers
CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number INT;
  new_quotation_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number FROM 3) AS INT)), 1000) + 1
  INTO new_number
  FROM quotations
  WHERE quotation_number LIKE 'QT%';

  new_quotation_number := 'QT' || new_number;
  RETURN new_quotation_number;
END;
$$;

-- Function to update quotation total
CREATE OR REPLACE FUNCTION public.update_quotation_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.quotations 
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0) 
    FROM public.quotation_items 
    WHERE quotation_id = COALESCE(NEW.quotation_id, OLD.quotation_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.quotation_id, OLD.quotation_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating quotation totals
CREATE TRIGGER update_quotation_total_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.quotation_items
  FOR EACH ROW EXECUTE FUNCTION public.update_quotation_total();

-- Function to convert quotation to job order
CREATE OR REPLACE FUNCTION public.convert_quotation_to_job_order(quotation_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quotation_record public.quotations%ROWTYPE;
  new_job_order_id UUID;
  job_number TEXT;
  item_record public.quotation_items%ROWTYPE;
  job_details TEXT := '';
BEGIN
  -- Get quotation details
  SELECT * INTO quotation_record 
  FROM public.quotations 
  WHERE id = quotation_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation not found';
  END IF;
  
  IF quotation_record.status = 'converted' THEN
    RAISE EXCEPTION 'Quotation already converted';
  END IF;
  
  -- Generate job order number
  SELECT public.generate_job_order_number('HO') INTO job_number;
  
  -- Build job details from quotation items
  FOR item_record IN 
    SELECT qi.*, jt.job_title_id 
    FROM public.quotation_items qi
    JOIN public.job_titles jt ON qi.job_title_id = jt.id
    WHERE qi.quotation_id = quotation_id_param
    ORDER BY qi.order_sequence
  LOOP
    job_details := job_details || item_record.job_title_id || ' - ' || item_record.description || 
                  ' (Qty: ' || item_record.quantity || ', Price: ' || item_record.unit_price || ')' || E'\n';
  END LOOP;
  
  -- Create job order
  INSERT INTO public.job_orders (
    job_order_number,
    customer_id,
    salesman_id,
    total_value,
    created_by,
    job_order_details,
    status,
    approval_status
  ) VALUES (
    job_number,
    quotation_record.customer_id,
    quotation_record.salesman_id,
    quotation_record.total_amount,
    quotation_record.created_by,
    job_details,
    'pending',
    'pending_approval'
  ) RETURNING id INTO new_job_order_id;
  
  -- Update quotation status
  UPDATE public.quotations 
  SET status = 'converted', 
      converted_to_job_order_id = new_job_order_id,
      updated_at = now()
  WHERE id = quotation_id_param;
  
  RETURN new_job_order_id;
END;
$$;

-- Add indexes for performance
CREATE INDEX idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX idx_quotations_salesman_id ON public.quotations(salesman_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_quotation_items_quotation_id ON public.quotation_items(quotation_id);