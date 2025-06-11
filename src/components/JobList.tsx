
import { useState } from "react";
import { Job, JobStatus } from "@/pages/Index";
import { CardStackSlider } from "@/components/CardStackSlider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobListProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, status: JobStatus) => void;
}

export function JobList({ jobs, onStatusUpdate }: JobListProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is admin
  useState(() => {
    const checkAdminRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        setIsAdmin(!!data);
      }
    };
    checkAdminRole();
  });

  return <CardStackSlider jobs={jobs} onStatusUpdate={onStatusUpdate} />;
}
