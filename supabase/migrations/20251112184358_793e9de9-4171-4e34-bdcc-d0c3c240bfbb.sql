-- Create activities table for tracking user activities
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing activities
CREATE POLICY "Users can view relevant activities"
  ON public.activities FOR SELECT
  USING (
    user_id = auth.uid() OR
    get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role]) OR
    EXISTS (
      SELECT 1 FROM public.job_orders jo
      WHERE jo.id = activities.entity_id::uuid
      AND activities.entity_type = 'job_order'
      AND (
        jo.created_by = auth.uid() OR
        jo.salesman_id::text = auth.uid()::text OR
        jo.designer_id::text = auth.uid()::text
      )
    )
  );

-- Create policy for inserting activities
CREATE POLICY "System can insert activities"
  ON public.activities FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON public.activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);