
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
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Job Order - ${job.jobOrderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              line-height: 1.6; 
              color: #1e293b;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 30px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
              color: white;
              padding: 40px;
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            }
            .header-content { position: relative; z-index: 1; }
            .company-logo {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(10px);
            }
            .job-number {
              font-size: 2.5rem;
              font-weight: 800;
              margin-bottom: 8px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .job-title {
              font-size: 1.5rem;
              font-weight: 600;
              opacity: 0.95;
              margin-bottom: 16px;
            }
            .status-badges {
              display: flex;
              gap: 12px;
              justify-content: center;
            }
            .badge {
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 0.875rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              background: rgba(255, 255, 255, 0.2);
              backdrop-filter: blur(10px);
            }
            .content {
              padding: 40px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 30px;
              margin-bottom: 40px;
            }
            .info-section {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border-radius: 12px;
              padding: 24px;
              border-left: 4px solid #3b82f6;
            }
            .section-title {
              font-size: 1.25rem;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
            }
            .info-table tr {
              border-bottom: 1px solid #e2e8f0;
            }
            .info-table tr:last-child {
              border-bottom: none;
            }
            .info-table td {
              padding: 12px 0;
              vertical-align: top;
            }
            .info-label {
              font-weight: 600;
              color: #475569;
              width: 35%;
              padding-right: 16px;
            }
            .info-value {
              color: #1e293b;
              font-weight: 500;
            }
            .description-section {
              background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
              border-radius: 12px;
              padding: 24px;
              border: 1px solid #e2e8f0;
              margin-bottom: 24px;
            }
            .description-title {
              font-size: 1.25rem;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 16px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e2e8f0;
            }
            .description-text {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              line-height: 1.7;
            }
            .footer {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              padding: 24px;
              text-align: center;
              color: #64748b;
              font-size: 0.875rem;
              border-top: 1px solid #e2e8f0;
            }
            .icon {
              width: 20px;
              height: 20px;
              fill: currentColor;
            }
            @media print {
              body { background: white !important; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-content">
                <div class="company-logo">
                  <svg class="icon" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                </div>
                <div class="job-number">${job.jobOrderNumber}</div>
                <div class="job-title">${job.title}</div>
                <div class="status-badges">
                  <span class="badge">${job.status.replace('-', ' ').toUpperCase()}</span>
                  <span class="badge">${job.priority.toUpperCase()} PRIORITY</span>
                </div>
              </div>
            </div>

            <div class="content">
              <div class="info-grid">
                <div class="info-section">
                  <h3 class="section-title">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
                      <path d="m22 21-3-3m0 0a2 2 0 0 0 0-4 2 2 0 0 0 0 4" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    Customer & Team
                  </h3>
                  <table class="info-table">
                    <tr>
                      <td class="info-label">Customer:</td>
                      <td class="info-value">${job.customer}</td>
                    </tr>
                    <tr>
                      <td class="info-label">Assignee:</td>
                      <td class="info-value">${job.assignee}</td>
                    </tr>
                    <tr>
                      <td class="info-label">Designer:</td>
                      <td class="info-value">${job.designer}</td>
                    </tr>
                    <tr>
                      <td class="info-label">Salesman:</td>
                      <td class="info-value">${job.salesman}</td>
                    </tr>
                    <tr>
                      <td class="info-label">Branch:</td>
                      <td class="info-value">${job.branch || 'Not specified'}</td>
                    </tr>
                  </table>
                </div>

                <div class="info-section">
                  <h3 class="section-title">
                    <svg class="icon" viewBox="0 0 24 24">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                      <line x1="16" x2="16" y1="2" y2="6" stroke="currentColor" stroke-width="2"/>
                      <line x1="8" x2="8" y1="2" y2="6" stroke="currentColor" stroke-width="2"/>
                      <line x1="3" x2="21" y1="10" y2="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Timeline & Details
                  </h3>
                  <table class="info-table">
                    <tr>
                      <td class="info-label">Created Date:</td>
                      <td class="info-value">${new Date(job.createdAt).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td class="info-label">Due Date:</td>
                      <td class="info-value">${new Date(job.dueDate).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td class="info-label">Est. Hours:</td>
                      <td class="info-value">${job.estimatedHours} hours</td>
                    </tr>
                    <tr>
                      <td class="info-label">Priority:</td>
                      <td class="info-value">${job.priority.toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td class="info-label">Status:</td>
                      <td class="info-value">${job.status.replace('-', ' ').toUpperCase()}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <div class="description-section">
                <h3 class="description-title">Job Description</h3>
                <div class="description-text">${job.description || 'No description provided.'}</div>
              </div>

              <div class="description-section">
                <h3 class="description-title">Job Order Details</h3>
                <div class="description-text">${job.jobOrderDetails || 'No additional details provided.'}</div>
              </div>
            </div>

            <div class="footer">
              <p><strong>JobFlow Management System</strong></p>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
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
