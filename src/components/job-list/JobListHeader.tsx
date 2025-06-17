
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface JobListHeaderProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export function JobListHeader({ 
  searchQuery, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange 
}: JobListHeaderProps) {
  const getStatusOptions = () => [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "designing", label: "Designing" },
    { value: "completed", label: "Completed" },
    { value: "invoiced", label: "Invoiced" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Management</h1>
          <p className="text-gray-600">Manage and track all your job orders</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs by title, order number, or customer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/90"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-40 bg-white/90">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {getStatusOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
