
-- Add the delivered_at column to the job_orders table
ALTER TABLE public.job_orders 
ADD COLUMN delivered_at TEXT;
