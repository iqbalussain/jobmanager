import { ApprovedJobsSlider } from "./ApprovedJobsSlider";
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent } from "@/components/ui/card";
import { JobDetails } from "@/components/JobDetails";
import { JobListHeader } from "@/components/job-list/JobListHeader";
import { JobStatsCards } from "@/components/job-list/JobStatsCards";
import { JobCard } from "@/components/job-list/JobCard";
import { EmptyJobState } from "@/components/job-list/EmptyJobState";
import { isWithinInterval } from "date-fns";

interface ApprovedJobsListProps {
  jobs: Job[];
  onStatusUpdate?: (jobId: string, status: string) => void;
}

export function ApprovedJobsList(props: any) {
  return <ApprovedJobsSlider {...props} />;
}
