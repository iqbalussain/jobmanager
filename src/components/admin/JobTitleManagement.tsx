
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { JobTitle } from "@/hooks/useJobTitleManagement";

interface JobTitleManagementProps {
  jobTitles: JobTitle[];
  jobTitlesLoading: boolean;
  jobTitleForm: { title: string };
  setJobTitleForm: (form: { title: string }) => void;
  onAddJobTitle: (e: React.FormEvent) => void;
  isAdding: boolean;
}

export function JobTitleManagement({
  jobTitles,
  jobTitlesLoading,
  jobTitleForm,
  setJobTitleForm,
  onAddJobTitle,
  isAdding
}: JobTitleManagementProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Job Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddJobTitle} className="space-y-4">
            <div>
              <Label htmlFor="jobTitleName">Job Title</Label>
              <Input
                id="jobTitleName"
                value={jobTitleForm.title}
                onChange={(e) => setJobTitleForm({ title: e.target.value })}
                placeholder="Enter job title"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add Job Title"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Job Titles</CardTitle>
        </CardHeader>
        <CardContent>
          {jobTitlesLoading ? (
            <p>Loading job titles...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobTitles.map((jobTitle) => (
                  <TableRow key={jobTitle.id}>
                    <TableCell className="font-medium">{jobTitle.job_title_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
