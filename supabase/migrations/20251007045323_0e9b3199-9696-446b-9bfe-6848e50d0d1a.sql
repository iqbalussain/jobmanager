-- Fix convert_quotation_to_job_order function to properly create job_order_items
-- This replaces the old version that stored items as text

CREATE OR REPLACE FUNCTION public.convert_quotation_to_job_order(quotation_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quotation_record public.quotations%ROWTYPE;
  new_job_order_id UUID;
  job_number TEXT;
  item_count INTEGER;
BEGIN
  -- Get quotation details
  SELECT * INTO quotation_record 
  FROM public.quotations 
  WHERE id = quotation_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation not found';
  END IF;
  
  -- Check if already converted (prevent duplicates)
  IF quotation_record.status = 'converted' AND quotation_record.converted_to_job_order_id IS NOT NULL THEN
    RAISE EXCEPTION 'Quotation already converted to job order %', quotation_record.converted_to_job_order_id;
  END IF;

  -- Check if quotation has items
  SELECT COUNT(*) INTO item_count
  FROM public.quotation_items
  WHERE quotation_id = quotation_id_param;

  IF item_count = 0 THEN
    RAISE EXCEPTION 'Cannot convert quotation without items';
  END IF;
  
  -- Generate job order number
  SELECT public.generate_job_order_number('HO') INTO job_number;
  
  -- Create job order (without text-based job_order_details)
  INSERT INTO public.job_orders (
    job_order_number,
    customer_id,
    salesman_id,
    total_value,
    created_by,
    status,
    approval_status,
    created_at,
    updated_at
  ) VALUES (
    job_number,
    quotation_record.customer_id,
    quotation_record.salesman_id,
    quotation_record.total_amount,
    quotation_record.created_by,
    'pending',
    'pending_approval',
    now(),
    now()
  ) RETURNING id INTO new_job_order_id;
  
  -- Copy items from quotation_items to job_order_items
  INSERT INTO public.job_order_items (
    job_order_id,
    job_title_id,
    description,
    quantity,
    unit_price,
    total_price,
    order_sequence,
    created_at,
    updated_at
  )
  SELECT 
    new_job_order_id,
    job_title_id,
    description,
    quantity,
    unit_price,
    total_price,
    order_sequence,
    now(),
    now()
  FROM public.quotation_items
  WHERE quotation_id = quotation_id_param
  ORDER BY order_sequence;
  
  -- Update quotation status
  UPDATE public.quotations 
  SET status = 'converted', 
      converted_to_job_order_id = new_job_order_id,
      updated_at = now()
  WHERE id = quotation_id_param;
  
  RETURN new_job_order_id;
END;
$$;