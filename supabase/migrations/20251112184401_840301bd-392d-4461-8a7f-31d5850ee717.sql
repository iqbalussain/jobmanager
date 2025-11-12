-- Add foreign key constraint for better data integrity on job_order_logs
-- This allows for cleaner queries in the future

-- First, check if the constraint already exists and drop it if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'job_order_logs_changed_by_fkey' 
    AND table_name = 'job_order_logs'
  ) THEN
    ALTER TABLE public.job_order_logs 
    DROP CONSTRAINT job_order_logs_changed_by_fkey;
  END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE public.job_order_logs
ADD CONSTRAINT job_order_logs_changed_by_fkey
FOREIGN KEY (changed_by)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_order_logs_changed_by 
ON public.job_order_logs(changed_by);

CREATE INDEX IF NOT EXISTS idx_job_order_logs_job_order_id 
ON public.job_order_logs(job_order_id);

CREATE INDEX IF NOT EXISTS idx_job_order_logs_changed_at 
ON public.job_order_logs(changed_at DESC);