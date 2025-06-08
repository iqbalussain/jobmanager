
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Job } from "@/pages/Index";
import { Plus, X } from "lucide-react";

interface JobFormProps {
  onSubmit: (job: Omit<Job, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export function JobForm({ onSubmit, onCancel }: JobFormProps) {
  const [formData, setFormData] = useState({
    branch: "",
    designer: "",
    salesman: "",
    title: "",
    description: "",
    jobOrderDetails: "",
    client: "",
    assignee: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "pending" as const,
    dueDate: "",
    estimatedHours: 1
  });

  const branches = ["Main Branch", "North Branch", "South Branch", "East Branch"];
  const designers = ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson"];
  const salesmen = ["Emma Brown", "Frank Miller", "Grace Lee", "Henry Taylor"];
  const jobTitles = ["HVAC Installation", "Plumbing Repair", "Electrical Work", "Maintenance Check", "System Upgrade"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      client: formData.client,
      assignee: formData.assignee,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      estimatedHours: formData.estimatedHours
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

            {/* Designer, Salesman, Job Title Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Designer *</Label>
                <Select 
                  value={formData.designer} 
                  onValueChange={(value) => handleInputChange("designer", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select designer" />
                  </SelectTrigger>
                  <SelectContent>
                    {designers.map((designer) => (
                      <SelectItem key={designer} value={designer}>{designer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Salesman *</Label>
                <Select 
                  value={formData.salesman} 
                  onValueChange={(value) => handleInputChange("salesman", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select salesman" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesmen.map((salesman) => (
                      <SelectItem key={salesman} value={salesman}>{salesman}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Job Title *</Label>
                <Select 
                  value={formData.title} 
                  onValueChange={(value) => handleInputChange("title", value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select job title" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.map((title) => (
                      <SelectItem key={title} value={title}>{title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

            {/* Client and Description Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-gray-700 font-medium">Client *</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => handleInputChange("client", e.target.value)}
                  placeholder="Enter client name"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

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
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job Order
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
