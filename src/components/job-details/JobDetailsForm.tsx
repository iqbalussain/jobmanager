
import { Job } from "@/pages/Index";
import { useDropdownData } from "@/hooks/useDropdownData";
import { CustomerTeamSection } from "./sections/CustomerTeamSection";
import { ProjectDetailsSection } from "./sections/ProjectDetailsSection";
import { JobOrderDetailsSection } from "./sections/JobOrderDetailsSection";

interface JobDetailsFormProps {
  job: Job;
  isEditMode: boolean;
  editData: Partial<Job>;
  onEditDataChange: (data: Partial<Job>) => void;
}

export function JobDetailsForm({ job, isEditMode, editData, onEditDataChange }: JobDetailsFormProps) {
  const { customers, jobTitles, isLoading: dropdownLoading } = useDropdownData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CustomerTeamSection
        job={job}
        isEditMode={isEditMode}
        editData={editData}
        onEditDataChange={onEditDataChange}
        customers={customers}
        dropdownLoading={dropdownLoading}
      />

      <ProjectDetailsSection
        job={job}
        isEditMode={isEditMode}
        editData={editData}
        onEditDataChange={onEditDataChange}
        jobTitles={jobTitles}
        dropdownLoading={dropdownLoading}
      />

      <JobOrderDetailsSection
        job={job}
        isEditMode={isEditMode}
        editData={editData}
        onEditDataChange={onEditDataChange}
      />
    </div>
  );
}
