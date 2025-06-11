
-- Create a table for tracking activities
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'job_order', 'customer', etc.
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view all activities (for dashboard visibility)
CREATE POLICY "Users can view all activities" 
  ON public.activities 
  FOR SELECT 
  USING (true);

-- Create policy that allows users to insert activities
CREATE POLICY "Users can create activities" 
  ON public.activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for activities table
ALTER TABLE public.activities REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.activities;

-- Create a function to automatically log activities when job orders are created/updated
CREATE OR REPLACE FUNCTION log_job_order_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (user_id, action, description, entity_type, entity_id)
    VALUES (
      NEW.created_by,
      'created',
      'Created job order ' || NEW.job_order_number,
      'job_order',
      NEW.id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      INSERT INTO public.activities (user_id, action, description, entity_type, entity_id)
      VALUES (
        COALESCE(auth.uid(), NEW.created_by),
        'status_updated',
        'Updated job order ' || NEW.job_order_number || ' status to ' || NEW.status,
        'job_order',
        NEW.id
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for job order activities
CREATE TRIGGER job_order_activity_trigger
  AFTER INSERT OR UPDATE ON public.job_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_job_order_activity();
