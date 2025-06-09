
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobTitle } from "@/hooks/useDropdownData";

interface JobDetailsSectionProps {
  jobTitle: string;
  assignee: string;
  onJobTitleChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  jobTitles: JobTitle[];
}

export function JobDetailsSection({ 
  jobTitle, 
  assignee, 
  onJobTitleChange, 
  onAssigneeChange, 
  jobTitles 
}: JobDetailsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="jobTitle">Job Title *</Label>
        <Select value={jobTitle} onValueChange={onJobTitleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select job title" />
          </SelectTrigger>
          <SelectContent>
            {jobTitles.map((title) => (
              <SelectItem key={title.id} value={title.id}>
                {title.job_title_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="assignee">Assignee</Label>
        <Input
          id="assignee"
          type="text"
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => onAssigneeChange(e.target.value)}
        />
      </div>
    </div>
  );
}
