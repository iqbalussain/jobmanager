-- Update Bilal's primary role from manager to designer
UPDATE public.profiles 
SET role = 'designer'
WHERE full_name = 'Bilal' AND role = 'manager';

-- Add manager role for Bilal in user_roles table to retain manager rights
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'manager'::app_role
FROM public.profiles 
WHERE full_name = 'Bilal' AND role = 'designer'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add admin roles for Aqeeb and Mohsin in user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles 
WHERE full_name IN ('Aqeeb', 'Mohsin') AND role = 'salesman'
ON CONFLICT (user_id, role) DO NOTHING;