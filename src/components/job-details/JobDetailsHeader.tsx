
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Job } from "@/pages/Index";

interface JobDetailsHeaderProps {
  job: Job;
  isEditMode: boolean;
  isExporting: boolean;
  onExportPDF: () => void;
}

export function JobDetailsHeader({ job, isEditMode, isExporting, onExportPDF }: JobDetailsHeaderProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600" />
        {isEditMode ? "Edit Job Order" : "Job Order Details"}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Job Order #{job.jobOrderNumber}</h3>
            <div className="flex gap-2 mt-2">
              <Badge className={getPriorityColor(job.priority)}>
                {job.priority} priority
              </Badge>
              <Badge className={getStatusColor(job.status)}>
                {job.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
          <Button
            onClick={onExportPDF}
            disabled={isExporting}
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>
    </>
  );
}
