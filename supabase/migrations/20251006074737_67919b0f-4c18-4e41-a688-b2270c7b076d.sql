-- Create job_order_comments table for chat functionality
CREATE TABLE IF NOT EXISTS public.job_order_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_order_id UUID NOT NULL REFERENCES public.job_orders(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_job_order_comments_job_order_id ON public.job_order_comments(job_order_id);
CREATE INDEX idx_job_order_comments_created_at ON public.job_order_comments(created_at);

-- Enable Row Level Security
ALTER TABLE public.job_order_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view comments for job orders they have access to
CREATE POLICY "Users can view comments for accessible job orders"
ON public.job_order_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.job_orders jo
    WHERE jo.id = job_order_comments.job_order_id
    AND (
      get_current_user_role() IN ('admin', 'manager')
      OR (get_current_user_role() = 'designer' AND jo.designer_id::text = auth.uid()::text)
      OR (get_current_user_role() = 'salesman' AND jo.salesman_id::text = auth.uid()::text)
      OR jo.created_by = auth.uid()
    )
  )
);

-- Users can add comments to job orders they have access to
CREATE POLICY "Users can add comments to accessible job orders"
ON public.job_order_comments
FOR INSERT
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.job_orders jo
    WHERE jo.id = job_order_comments.job_order_id
    AND (
      get_current_user_role() IN ('admin', 'manager')
      OR (get_current_user_role() = 'designer' AND jo.designer_id::text = auth.uid()::text)
      OR (get_current_user_role() = 'salesman' AND jo.salesman_id::text = auth.uid()::text)
      OR jo.created_by = auth.uid()
    )
  )
);

-- Enable realtime for comments
ALTER TABLE public.job_order_comments REPLICA IDENTITY FULL;