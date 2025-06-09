
-- Fix existing RLS policies conflicts

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Authenticated users can create job orders" ON public.job_orders;
DROP POLICY IF EXISTS "Users can view job orders based on role" ON public.job_orders;
DROP POLICY IF EXISTS "Users can update job orders based on role" ON public.job_orders;
DROP POLICY IF EXISTS "Admins and managers can delete job orders" ON public.job_orders;

-- Enable RLS on all tables first
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salesmen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for job_titles table
CREATE POLICY "job_titles_select_policy" 
  ON public.job_titles 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "job_titles_insert_policy" 
  ON public.job_titles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "job_titles_update_policy" 
  ON public.job_titles 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "job_titles_delete_policy" 
  ON public.job_titles 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create comprehensive RLS policies for customers table
CREATE POLICY "customers_select_policy" 
  ON public.customers 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "customers_insert_policy" 
  ON public.customers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'salesman')
    )
  );

CREATE POLICY "customers_update_policy" 
  ON public.customers 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "customers_delete_policy" 
  ON public.customers 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create comprehensive RLS policies for designers table
CREATE POLICY "designers_select_policy" 
  ON public.designers 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "designers_insert_policy" 
  ON public.designers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "designers_update_policy" 
  ON public.designers 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "designers_delete_policy" 
  ON public.designers 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create comprehensive RLS policies for salesmen table
CREATE POLICY "salesmen_select_policy" 
  ON public.salesmen 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "salesmen_insert_policy" 
  ON public.salesmen 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "salesmen_update_policy" 
  ON public.salesmen 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "salesmen_delete_policy" 
  ON public.salesmen 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create comprehensive RLS policies for job_orders table
CREATE POLICY "job_orders_select_policy" 
  ON public.job_orders 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND (
        p.role IN ('admin', 'manager', 'job_order_manager') OR
        (p.role = 'designer' AND designer_id::text = p.id::text) OR
        (p.role = 'salesman' AND salesman_id::text = p.id::text) OR
        created_by = auth.uid()
      )
    )
  );

CREATE POLICY "job_orders_insert_policy" 
  ON public.job_orders 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "job_orders_update_policy" 
  ON public.job_orders 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND (
        p.role IN ('admin', 'manager', 'job_order_manager') OR
        created_by = auth.uid()
      )
    )
  );

CREATE POLICY "job_orders_delete_policy" 
  ON public.job_orders 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "profiles_select_policy" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "profiles_update_policy" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "profiles_delete_policy" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add data integrity constraints (with IF NOT EXISTS equivalent checks)
DO $$ 
BEGIN
  -- Add constraints only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_priority') THEN
    ALTER TABLE public.job_orders 
    ADD CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_status') THEN
    ALTER TABLE public.job_orders 
    ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'in-progress', 'designing', 'completed', 'finished', 'cancelled', 'invoiced'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_name_length') THEN
    ALTER TABLE public.customers 
    ADD CONSTRAINT customer_name_length CHECK (length(name) <= 255 AND length(name) > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'designer_name_length') THEN
    ALTER TABLE public.designers 
    ADD CONSTRAINT designer_name_length CHECK (length(name) <= 255 AND length(name) > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'salesman_name_length') THEN
    ALTER TABLE public.salesmen 
    ADD CONSTRAINT salesman_name_length CHECK (length(name) <= 255 AND length(name) > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_title_length') THEN
    ALTER TABLE public.job_titles 
    ADD CONSTRAINT job_title_length CHECK (length(job_title_id) <= 255 AND length(job_title_id) > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_order_details_length') THEN
    ALTER TABLE public.job_orders 
    ADD CONSTRAINT job_order_details_length CHECK (length(job_order_details) <= 10000);
  END IF;
END $$;
