-- Drop and recreate constraint to include ALL status values including new ones
ALTER TABLE job_orders DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE job_orders ADD CONSTRAINT valid_status 
CHECK (status = ANY (ARRAY['pending'::job_status, 'in-progress'::job_status, 'designing'::job_status, 'out'::job_status, 'completed'::job_status, 'finished'::job_status, 'cancelled'::job_status, 'invoiced'::job_status, 'foc_sample'::job_status]));

-- Now update existing 'designing' status to 'out'  
UPDATE job_orders SET status = 'out' WHERE status = 'designing';