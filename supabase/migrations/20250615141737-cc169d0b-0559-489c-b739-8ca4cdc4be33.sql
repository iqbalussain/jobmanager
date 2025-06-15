
-- Add approval tracking fields to job_orders table
ALTER TABLE public.job_orders
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending_approval',
  ADD COLUMN IF NOT EXISTS approved_by UUID NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS approval_notes TEXT NULL;

-- Optionally, create an index for faster lookup of pending approvals
CREATE INDEX IF NOT EXISTS idx_job_orders_approval_status ON public.job_orders(approval_status);

-- Add a comment for maintainers
COMMENT ON COLUMN public.job_orders.approval_status IS 'Tracks administrative approval status for job order workflow';

-- No change to RLS needed, as admin-only action will be enforced in code
