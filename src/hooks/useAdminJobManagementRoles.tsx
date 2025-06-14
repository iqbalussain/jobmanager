
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useAdminJobManagementRoles() {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setUserRoles([]);
        setRolesLoading(false);
        return;
      }
      setRolesLoading(true);
      setRolesError(null);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          setUserRoles([]);
          setRolesError("Failed to load roles: " + error.message);
        } else if (!data) {
          setUserRoles([]);
        } else {
          const roles = data.map((row: { role: string }) => row.role);
          setUserRoles(roles);
          console.log("[DEBUG] Fetched user roles:", roles, "for user:", user.id);
        }
      } catch (err: any) {
        setRolesError("Error loading roles: " + (err?.message || err));
        setUserRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  return { user, userRoles, rolesLoading, rolesError };
}
