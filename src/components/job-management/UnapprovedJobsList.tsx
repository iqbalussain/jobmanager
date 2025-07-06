import { UnapprovedJobsTable } from "./UnapprovedJobsTable";
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { JobListHeader } from "@/components/job-list/JobListHeader";
import { EmptyJobState } from "@/components/job-list/EmptyJobState";
import { CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isWithinInterval } from "date-fns";

interface UnapprovedJobsListProps {
  jobs: Job[];
  userRole: string;
  onJobApproved?: () => void;
}

export function UnapprovedJobsList(props: any) {
  return <UnapprovedJobsTable {...props} />;
}
