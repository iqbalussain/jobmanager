
import { useState, useEffect } from "react";
import { Job } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  User,
  Clock,
  Building,
  FileText,
  Save,
  X as XIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  isEditMode?: boolean;
}

export function JobDetails({ isOpen, onClose, job, isEditMode = false }: JobDetailsProps) {
  const [editData, setEditData] = useState<Partial<Job>>({});
  const [customers, setCustomers] = useState<Array<{id: string, name: string}>>([]);
  const [designers, setDesigners] = useState<Array<{id: string, name: string}>>([]);
  const [salesmen, setSalesmen] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (job) {
      setEditData({
        title: job.title,
        description: job.description,
        priority: job.priority,
        dueDate: job.dueDate,
        estimatedHours: job.estimatedHours,
        branch: job.branch,
        jobOrderDetails: job.jobOrderDetails
      });
    }
  }, [job]);

  useEffect(() => {
    if (isEditMode && isOpen) {
      fetchDropdownData();
    }
  }, [isEditMode, isOpen]);

  const fetchDropdownData = async () => {
    try {
      const [customersRes, designersRes, salesmenRes] = await Promise.all([
        supabase.from('customers').select('id, name'),
        supabase.from('designers').select('id, name'),
        supabase.from('salesmen').select('id, name')
      ]);

      if (customersRes.data) setCustomers(customersRes.data);
      if (designersRes.data) setDesigners(designersRes.data);
      if (salesmenRes.data) setSalesmen(salesmenRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleSave = async () => {
    if (!job) return;

    setIsLoading(true);
    try {
      const updateData: any = {
        title: editData.title,
        description: editData.description,
        priority: editData.priority,
        due_date: editData.dueDate,
        estimated_hours: editData.estimatedHours,
        branch: editData.branch,
        job_order_details: editData.jobOrderDetails,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('job_orders')
        .update(updateData)
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job order updated successfully",
      });
      
      onClose();
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      case "designing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "finished": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "invoiced": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            {isEditMode ? "Edit Job Order" : "Job Order Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Order Header */}
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
            </div>
          </div>

          {/* Job Details Form/Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                {isEditMode ? (
                  <Input
                    id="title"
                    value={editData.title || ''}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{job.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                {isEditMode ? (
                  <Textarea
                    id="description"
                    value={editData.description || ''}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{job.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                {isEditMode ? (
                  <Select value={editData.priority} onValueChange={(value) => setEditData({...editData, priority: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getPriorityColor(job.priority)}>
                    {job.priority} priority
                  </Badge>
                )}
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                {isEditMode ? (
                  <Input
                    id="dueDate"
                    type="date"
                    value={editData.dueDate || ''}
                    onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(job.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Customer</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Building className="w-4 h-4" />
                  <span>{job.customer}</span>
                </div>
              </div>

              <div>
                <Label>Assignee</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{job.assignee}</span>
                </div>
              </div>

              <div>
                <Label>Designer</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{job.designer}</span>
                </div>
              </div>

              <div>
                <Label>Salesman</Label>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{job.salesman}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                {isEditMode ? (
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={editData.estimatedHours || 0}
                    onChange={(e) => setEditData({...editData, estimatedHours: parseInt(e.target.value) || 0})}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{job.estimatedHours} hours</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="branch">Branch</Label>
                {isEditMode ? (
                  <Input
                    id="branch"
                    value={editData.branch || ''}
                    onChange={(e) => setEditData({...editData, branch: e.target.value})}
                  />
                ) : (
                  <p className="text-gray-700">{job.branch || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Order Details */}
          <div>
            <Label htmlFor="jobOrderDetails">Job Order Details</Label>
            {isEditMode ? (
              <Textarea
                id="jobOrderDetails"
                value={editData.jobOrderDetails || ''}
                onChange={(e) => setEditData({...editData, jobOrderDetails: e.target.value})}
                rows={4}
                placeholder="Additional job order details..."
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {job.jobOrderDetails || 'No additional details provided.'}
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <Label>Created At</Label>
              <p className="text-sm text-gray-600">{new Date(job.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditMode && (
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                <XIcon className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
