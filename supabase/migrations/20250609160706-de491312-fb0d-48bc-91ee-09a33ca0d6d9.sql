
-- Fix RLS policies for customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view customers" 
  ON public.customers 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to create customers" 
  ON public.customers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Fix RLS policies for salesmen table
ALTER TABLE public.salesmen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view salesmen" 
  ON public.salesmen 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to create salesmen" 
  ON public.salesmen 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Fix RLS policies for designers table
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view designers" 
  ON public.designers 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to create designers" 
  ON public.designers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Fix RLS policies for job_orders table
ALTER TABLE public.job_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view job orders" 
  ON public.job_orders 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to create job orders" 
  ON public.job_orders 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update job orders" 
  ON public.job_orders 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Fix RLS policies for job_titles table
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view job titles" 
  ON public.job_titles 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to create job titles" 
  ON public.job_titles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
