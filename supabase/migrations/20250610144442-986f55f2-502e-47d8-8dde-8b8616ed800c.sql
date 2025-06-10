
-- Add invoice_number column to job_orders table
ALTER TABLE public.job_orders 
ADD COLUMN invoice_number TEXT;
