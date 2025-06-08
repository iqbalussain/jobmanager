
import { Job } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Calendar, User, Building, Clock } from "lucide-react";

interface JobDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export function JobDetails({ isOpen, onClose, job }: JobDetailsProps) {
  if (!job) return null;

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
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const exportToPDF = () => {
    // Create a formatted print version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Job Order - ${job.jobOrderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .job-number { font-size: 24px; font-weight: bold; color: #333; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #444; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .detail-row { display: flex; margin-bottom: 8px; }
            .detail-label { font-weight: bold; min-width: 150px; }
            .detail-value { flex: 1; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .priority { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .description { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JOB ORDER DETAILS</h1>
            <div class="job-number">${job.jobOrderNumber}</div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Basic Information</h2>
            <div class="detail-row">
              <span class="detail-label">Job Title:</span>
              <span class="detail-value">${job.title}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Customer:</span>
              <span class="detail-value">${job.customer}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Branch:</span>
              <span class="detail-value">${job.branch}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">${job.status.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Priority:</span>
              <span class="detail-value">${job.priority.toUpperCase()}</span>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Assignment Details</h2>
            <div class="detail-row">
              <span class="detail-label">Assignee:</span>
              <span class="detail-value">${job.assignee}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Designer:</span>
              <span class="detail-value">${job.designer}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Salesman:</span>
              <span class="detail-value">${job.salesman}</span>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Timeline</h2>
            <div class="detail-row">
              <span class="detail-label">Created Date:</span>
              <span class="detail-value">${new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${new Date(job.dueDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estimated Hours:</span>
              <span class="detail-value">${job.estimatedHours} hours</span>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Description</h2>
            <div class="description">${job.description}</div>
          </div>

          <div class="section">
            <h2 class="section-title">Job Order Details</h2>
            <div class="description">${job.jobOrderDetails}</div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">Job Details - {job.jobOrderNumber}</DialogTitle>
          <Button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(job.priority)}>
                {job.priority} priority
              </Badge>
              <Badge className={getStatusColor(job.status)}>
                {job.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Customer:</span>
                <span>{job.customer}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Assignee:</span>
                <span>{job.assignee}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Designer:</span>
                <span>{job.designer}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Salesman:</span>
                <span>{job.salesman}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Due Date:</span>
                <span>{new Date(job.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Estimated Hours:</span>
                <span>{job.estimatedHours}h</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Branch:</span>
                <span>{job.branch}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Created:</span>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-600 bg-gray-50 p-3 rounded">{job.description}</p>
          </div>

          {/* Job Order Details */}
          <div>
            <h4 className="font-medium mb-2">Job Order Details</h4>
            <p className="text-gray-600 bg-gray-50 p-3 rounded">{job.jobOrderDetails}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
