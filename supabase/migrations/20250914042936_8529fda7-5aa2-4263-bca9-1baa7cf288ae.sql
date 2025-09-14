-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create storage bucket for branch logos
INSERT INTO storage.buckets (id, name, public) VALUES ('branch-logos', 'branch-logos', true);

-- Create policies for branch logo uploads
CREATE POLICY "Branch logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'branch-logos');

CREATE POLICY "Admins can upload branch logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'branch-logos' AND (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])));

CREATE POLICY "Admins can update branch logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'branch-logos' AND (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])));

CREATE POLICY "Admins can delete branch logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'branch-logos' AND (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])));

-- Create job_order_items table for multiple job titles support
CREATE TABLE public.job_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_order_id UUID NOT NULL,
  job_title_id UUID NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC,
  total_price NUMERIC,
  order_sequence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on job_order_items
ALTER TABLE public.job_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for job_order_items
CREATE POLICY "Users can view job order items for accessible job orders" 
ON public.job_order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM job_orders jo 
  WHERE jo.id = job_order_items.job_order_id 
  AND (
    (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])) OR
    ((get_current_user_role() = 'designer'::app_role) AND jo.designer_id::text = auth.uid()::text) OR
    ((get_current_user_role() = 'salesman'::app_role) AND jo.salesman_id::text = auth.uid()::text) OR
    (jo.created_by = auth.uid())
  )
));

CREATE POLICY "Users can manage job order items for accessible job orders" 
ON public.job_order_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM job_orders jo 
  WHERE jo.id = job_order_items.job_order_id 
  AND (
    (get_current_user_role() = ANY (ARRAY['admin'::app_role, 'manager'::app_role])) OR
    (jo.created_by = auth.uid())
  )
));

-- Create trigger to update job order items updated_at
CREATE TRIGGER update_job_order_items_updated_at
BEFORE UPDATE ON public.job_order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_job_order_items_job_order_id ON public.job_order_items(job_order_id);
CREATE INDEX idx_job_order_items_job_title_id ON public.job_order_items(job_title_id);