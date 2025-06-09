
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X } from "lucide-react";
import { useDropdownData } from "@/hooks/useDropdownData";
import { useCreateJobOrder } from "@/hooks/useCreateJobOrder";

interface JobFormProps {
  onCancel: () => void;
}

export function JobForm({ onCancel }: JobFormProps) {
  const { customers, designers, salesmen, jobTitles, isLoading } = useDropdownData();
  const { createJobOrder, isCreating } = useCreateJobOrder();
  
  const [formData, setFormData] = useState({
    branch: "",
    designerId: "",
    salesmanId: "",
    title: "",
    description: "",
    jobOrderDetails: "",
    customerId: "",
    jobTitleId: "",
    assignee: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "pending" as const,
    dueDate: "",
    estimatedHours: 1
  });

  const branches = ["Wadi Kabeer", "Head Office"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.branch || !formData.customerId || !formData.designerId || 
        !formData.salesmanId || !formData.jobTitleId || !formData.jobOrderDetails || 
        !formData.assignee || !formData.dueDate) {
      console.log('Missing required fields:', {
        branch: formData.branch,
        customerId: formData.customerId,
        designerId: formData.designerId,
        salesmanId: formData.salesmanId,
        jobTitleId: formData.jobTitleId,
        jobOrderDetails: formData.jobOrderDetails,
        assignee: formData.assignee,
        dueDate: formData.dueDate
      });
      return;
    }

    // Find selected job title for the title field
    const selectedJobTitle = jobTitles.find(jt => jt.id === formData.jobTitleId);
    
    console.log('Submitting job order with data:', {
      title: selectedJobTitle?.title || formData.title,
      description: formData.description,
      customer_id: formData.customerId,
      job_title_id: formData.jobTitleId,
      designer_id: formData.designerId,
      salesman_id: formData.salesmanId,
      assignee: formData.assignee,
      priority: formData.priority,
      status: formData.status,
      due_date: formData.dueDate,
      estimated_hours: formData.estimatedHours,
      branch: formData.branch,
      job_order_details: formData.jobOrderDetails
    });

    try {
      await createJobOrder({
        title: selectedJobTitle?.title || formData.title,
        description: formData.description,
        customer_id: formData.customerId,
        job_title_id: formData.jobTitleId,
        designer_id: formData.designerId,
        salesman_id: formData.salesmanId,
        assignee: formData.assignee,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.dueDate,
        estimated_hours: formData.estimatedHours,
        branch: formData.branch,
        job_order_details: formData.jobOrderDetails
      });

      // Reset form after successful submission
      setFormData({
        branch: "",
        designerId: "",
        salesmanId: "",
        title: "",
        description: "",
        jobOrderDetails: "",
        customerId: "",
        jobTitleId: "",
        assignee: "",
        priority: "medium",
        status: "pending",
        dueDate: "",
        estimatedHours: 1
      });

      // Navigate back to dashboard
      onCancel();
    } catch (error) {
      console.error('Error creating job order:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading form data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job Order</h1>
        <p className="text-gray-600">Fill in the details for the new work order</p>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-4xl">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Plus className="w-5 h-5 text-blue-600" />
            Job Order Details
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Branch Selection */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">Branch *</Label>
              <RadioGroup 
                value={formData.branch} 
                onValueChange={(value) => handleInputChange("branch", value)}
                className="flex flex-wrap gap-6"
              >
                {branches.map((branch) => (
                  <div key={branch} className="flex items-center space-x-2">
                    <RadioGroupItem value={branch} id={branch} />
                    <Label htmlFor={branch} className="text-sm font-normal cursor-pointer">
                      {branch}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Customer, Designer, Salesman Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Customer *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => handleInputChange("customerId", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Designer *</Label>
                <Select 
                  value={formData.designerId} 
                  onValueChange={(value) => handleInputChange("designerId", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select designer" />
                  </SelectTrigger>
                  <SelectContent>
                    {designers.map((designer) => (
                      <SelectItem key={designer.id} value={designer.id}>{designer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Salesman *</Label>
                <Select 
                  value={formData.salesmanId} 
                  onValueChange={(value) => handleInputChange("salesmanId", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select salesman" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesmen.map((salesman) => (
                      <SelectItem key={salesman.id} value={salesman.id}>{salesman.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Job Title *</Label>
              <Select 
                value={formData.jobTitleId} 
                onValueChange={(value) => handleInputChange("jobTitleId", value)}
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select job title" />
                </SelectTrigger>
                <SelectContent>
                  {jobTitles.map((jobTitle) => (
                    <SelectItem key={jobTitle.id} value={jobTitle.id}>{jobTitle.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Order Details */}
            <div className="space-y-2">
              <Label htmlFor="jobOrderDetails" className="text-gray-700 font-medium">Job Order Details *</Label>
              <Textarea
                id="jobOrderDetails"
                value={formData.jobOrderDetails}
                onChange={(e) => handleInputChange("jobOrderDetails", e.target.value)}
                placeholder="Enter detailed job order information, specifications, and requirements"
                required
                rows={4}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Assignee and Description Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-gray-700 font-medium">Assignee *</Label>
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => handleInputChange("assignee", e.target.value)}
                  placeholder="Assigned technician"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Additional description or notes"
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Priority, Estimated Hours, Due Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange("priority", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours" className="text-gray-700 font-medium">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange("estimatedHours", parseFloat(e.target.value))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-gray-700 font-medium">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? "Creating..." : "Create Job Order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
