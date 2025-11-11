import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, MessageCircle, History } from "lucide-react";
import { Job } from "@/pages/Index";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JobEditLog } from "./JobEditLog";

interface JobDetailsHeaderProps {
  job: Job;
  isEditMode: boolean;
  isExporting: boolean;
  isSharing: boolean;
  onExportPDF: () => void;
  onShareWhatsApp: () => void;
}

export function JobDetailsHeader({ 
  job, 
  isEditMode, 
  isExporting, 
  isSharing, 
  onExportPDF, 
  onShareWhatsApp 
}: JobDetailsHeaderProps) {
  const [showEditLog, setShowEditLog] = useState(false);
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      return data?.role;
    },
    enabled: !!user?.id
  });

  const isAdmin = userRole === "admin";
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
          <div className="flex gap-2">
            {isAdmin && !isEditMode && (
              <Button
                onClick={() => setShowEditLog(true)}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50"
              >
                <History className="w-4 h-4 mr-2" />
                Log
              </Button>
            )}
            <Button
              onClick={onShareWhatsApp}
              disabled={isSharing}
              variant="outline"
              className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isSharing ? 'Sharing...' : 'WhatsApp'}
            </Button>
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
      </div>

      <JobEditLog
        jobOrderId={job.id}
        jobOrderNumber={job.jobOrderNumber}
        isOpen={showEditLog}
        onClose={() => setShowEditLog(false)}
      />
    </>
  );
}
