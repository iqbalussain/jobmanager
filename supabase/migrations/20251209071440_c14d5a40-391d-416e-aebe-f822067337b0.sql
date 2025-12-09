-- Create daily_checklists table for AI-generated checklists
CREATE TABLE IF NOT EXISTS public.daily_checklists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  items jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient date lookups
CREATE INDEX IF NOT EXISTS idx_daily_checklists_date ON public.daily_checklists(date);

-- Enable RLS
ALTER TABLE public.daily_checklists ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view checklists
CREATE POLICY "Authenticated users can view checklists"
ON public.daily_checklists
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow system/edge functions to insert checklists
CREATE POLICY "System can insert checklists"
ON public.daily_checklists
FOR INSERT
WITH CHECK (true);

-- Allow admins and managers to update checklists (for marking items done)
CREATE POLICY "Admins and managers can update checklists"
ON public.daily_checklists
FOR UPDATE
USING (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

-- Add description column to job_orders for rich text
ALTER TABLE public.job_orders ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.job_orders ADD COLUMN IF NOT EXISTS description_plain text;