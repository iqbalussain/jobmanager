-- Keep profile roles authoritative and prevent users from assigning themselves privileges.
CREATE OR REPLACE FUNCTION public.guard_profile_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  actor_role public.app_role;
  trusted_request boolean;
BEGIN
  trusted_request := auth.role() = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin');
  actor_role := public.get_current_user_role();

  IF trusted_request OR actor_role = 'admin' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS NOT NULL AND NEW.role <> 'employee'::public.app_role THEN
      RAISE EXCEPTION 'Only administrators can assign profile roles';
    END IF;
    IF NEW.is_active IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'Only administrators can change profile activation status';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Only administrators can change profile roles';
  END IF;
  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Only administrators can change profile activation status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_role_changes ON public.profiles;
CREATE TRIGGER guard_profile_role_changes
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_role_changes();

CREATE OR REPLACE FUNCTION public.sync_profile_role_to_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_roles WHERE user_id = OLD.id;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = NEW.id;
  IF NEW.role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, NEW.role);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_profile_role_to_user_roles() FROM PUBLIC;
DROP TRIGGER IF EXISTS sync_profile_role_to_user_roles ON public.profiles;
CREATE TRIGGER sync_profile_role_to_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_user_roles();

DELETE FROM public.user_roles ur
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profiles p
  WHERE p.id = ur.user_id
);

DELETE FROM public.user_roles ur
USING public.profiles p
WHERE p.id = ur.user_id
  AND (p.role IS NULL OR ur.role <> p.role);

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role
FROM public.profiles p
WHERE p.role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = p.id
      AND ur.role = p.role
  );

DROP POLICY IF EXISTS "Phase 1 restrict profile inserts" ON public.profiles;
CREATE POLICY "Phase 1 restrict profile inserts"
  ON public.profiles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (id = auth.uid() AND role = 'employee'::public.app_role AND is_active)
    OR public.get_current_user_role() = 'admin'::public.app_role
  );

DROP POLICY IF EXISTS "Phase 1 restrict profile updates" ON public.profiles;
CREATE POLICY "Phase 1 restrict profile updates"
  ON public.profiles
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR public.get_current_user_role() = 'admin'::public.app_role
  )
  WITH CHECK (
    id = auth.uid()
    OR public.get_current_user_role() = 'admin'::public.app_role
  );

-- Row-level policies cannot limit specific columns; reject unauthorized changes to
-- monetary, invoice, and approval fields even when a user may edit the job row.
CREATE OR REPLACE FUNCTION public.guard_sensitive_job_order_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  actor_role public.app_role;
BEGIN
  IF auth.role() = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  actor_role := public.get_current_user_role();
  IF actor_role IN ('admin'::public.app_role, 'manager'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.total_value IS NOT NULL
      OR NEW.invoice_number IS NOT NULL
      OR (NEW.approval_status IS NOT NULL
        AND NEW.approval_status <> 'pending_approval')
      OR NEW.approval_notes IS NOT NULL
      OR NEW.approved_by IS NOT NULL
      OR NEW.approved_at IS NOT NULL THEN
      RAISE EXCEPTION 'Only administrators and managers can set protected job fields';
    END IF;
    RETURN NEW;
  END IF;

  IF ROW(
    NEW.total_value,
    NEW.invoice_number,
    NEW.approval_status,
    NEW.approval_notes,
    NEW.approved_by,
    NEW.approved_at
  ) IS DISTINCT FROM ROW(
    OLD.total_value,
    OLD.invoice_number,
    OLD.approval_status,
    OLD.approval_notes,
    OLD.approved_by,
    OLD.approved_at
  ) THEN
    RAISE EXCEPTION 'Only administrators and managers can change protected job fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_sensitive_job_order_fields ON public.job_orders;
CREATE TRIGGER guard_sensitive_job_order_fields
  BEFORE INSERT OR UPDATE ON public.job_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_sensitive_job_order_fields();

DROP POLICY IF EXISTS "Phase 1 restrict job updates" ON public.job_orders;
CREATE POLICY "Phase 1 restrict job updates"
  ON public.job_orders
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN (
      'admin'::public.app_role,
      'manager'::public.app_role,
      'job_order_manager'::public.app_role
    )
    OR created_by = auth.uid()
    OR designer_id = auth.uid()
    OR salesman_id = auth.uid()
  )
  WITH CHECK (
    public.get_current_user_role() IN (
      'admin'::public.app_role,
      'manager'::public.app_role,
      'job_order_manager'::public.app_role
    )
    OR created_by = auth.uid()
    OR designer_id = auth.uid()
    OR salesman_id = auth.uid()
  );

CREATE OR REPLACE FUNCTION public.guard_notification_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF ROW(
    NEW.id,
    NEW.user_id,
    NEW.job_id,
    NEW.type,
    NEW.message,
    NEW.payload,
    NEW.created_at
  ) IS DISTINCT FROM ROW(
    OLD.id,
    OLD.user_id,
    OLD.job_id,
    OLD.type,
    OLD.message,
    OLD.payload,
    OLD.created_at
  ) THEN
    RAISE EXCEPTION 'Notification content and ownership cannot be changed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_notification_updates ON public.notifications;
CREATE TRIGGER guard_notification_updates
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_notification_updates();

DROP POLICY IF EXISTS "Phase 1 restrict notification access" ON public.notifications;
CREATE POLICY "Phase 1 restrict notification access"
  ON public.notifications
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Phase 1 restrict checklist access" ON public.daily_checklists;
CREATE POLICY "Phase 1 restrict checklist access"
  ON public.daily_checklists
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    public.get_current_user_role() IN (
      'admin'::public.app_role,
      'manager'::public.app_role,
      'job_order_manager'::public.app_role
    )
  )
  WITH CHECK (
    public.get_current_user_role() IN (
      'admin'::public.app_role,
      'manager'::public.app_role,
      'job_order_manager'::public.app_role
    )
  );
