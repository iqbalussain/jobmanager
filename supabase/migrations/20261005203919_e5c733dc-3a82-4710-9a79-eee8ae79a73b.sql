CREATE OR REPLACE FUNCTION public.is_active_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _user_id AND COALESCE(p.is_active, true))
     AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = _user_id)
$$;
REVOKE EXECUTE ON FUNCTION public.is_active_staff(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_active_staff(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "All authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Active staff can view companies" ON public.companies;
CREATE POLICY "Active staff can view companies" ON public.companies
  FOR SELECT TO authenticated USING (public.is_active_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Active staff can view customers" ON public.customers;
CREATE POLICY "Active staff can view customers" ON public.customers
  FOR SELECT TO authenticated USING (public.is_active_staff(auth.uid()));