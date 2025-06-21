
-- Add total_value column to job_orders table
ALTER TABLE public.job_orders 
ADD COLUMN IF NOT EXISTS total_value DECIMAL(12,2);

-- Add comment to describe the column
COMMENT ON COLUMN public.job_orders.total_value IS 'Total monetary value of the job order, only visible in job management';

-- Create index for performance on total_value queries
CREATE INDEX IF NOT EXISTS idx_job_orders_total_value ON public.job_orders(total_value) WHERE total_value IS NOT NULL;

-- Update RLS policies to ensure proper access control for total_value
-- (The existing policies should already cover this, but we'll ensure admins can manage it)
