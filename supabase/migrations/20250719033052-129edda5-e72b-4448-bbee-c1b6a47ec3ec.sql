-- Add client_name field to job_orders table for cash customers
ALTER TABLE public.job_orders 
ADD COLUMN client_name TEXT NULL;

-- Add a comment to explain the field usage
COMMENT ON COLUMN public.job_orders.client_name IS 'Client name for cash customers - only used when customer_id refers to a cash customer entry';

-- Insert or update cash customer entry if it doesn't exist
INSERT INTO public.customers (id, name, created_by) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Cash Customer', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;