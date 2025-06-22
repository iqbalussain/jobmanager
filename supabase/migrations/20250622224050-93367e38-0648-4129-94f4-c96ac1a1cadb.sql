
-- Add foreign key relationships for job_orders table to fix the report generation issue
ALTER TABLE public.job_orders 
ADD CONSTRAINT fk_job_orders_customer 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.job_orders 
ADD CONSTRAINT fk_job_orders_salesman 
FOREIGN KEY (salesman_id) REFERENCES public.profiles(id);

ALTER TABLE public.job_orders 
ADD CONSTRAINT fk_job_orders_designer 
FOREIGN KEY (designer_id) REFERENCES public.profiles(id);

ALTER TABLE public.job_orders 
ADD CONSTRAINT fk_job_orders_created_by 
FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.job_orders 
ADD CONSTRAINT fk_job_orders_approved_by 
FOREIGN KEY (approved_by) REFERENCES public.profiles(id);
