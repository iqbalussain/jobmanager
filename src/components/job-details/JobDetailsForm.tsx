import { Job } from "@/types/jobOrder";
import { useDropdownData } from "@/hooks/useDropdownData";
import { CustomerTeamSection } from "./sections/CustomerTeamSection";
import { ProjectDetailsSection } from "./sections/ProjectDetailsSection";
import { JobOrderDetailsSection } from "./sections/JobOrderDetailsSection";
import { ImageSection } from "./sections/ImageSection";
import { JobOrderItemsForm } from "@/components/JobOrderItemsForm";

interface JobDetailsFormProps {
  job: Job;
  isEditMode: boolean;
  editData: Partial<Job>;
  onEditDataChange: (data: Partial<Job>) => void;
}

export function JobDetailsForm({ job, isEditMode, editData, onEditDataChange }: JobDetailsFormProps) {
  const { customers, jobTitles, isLoading: dropdownLoading } = useDropdownData();

  return (
    <div className="space-y-6">
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

      {/* Job Order Items Section */}
      <div className="col-span-full">
        <JobOrderItemsForm 
          jobOrderId={job.id} 
          readOnly={!isEditMode}
        />
      </div>

      {/* Image section spans full width */}
      <ImageSection 
        job={job} 
        isEditMode={isEditMode} 
      />
    </div>
  );
}
