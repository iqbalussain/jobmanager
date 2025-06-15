
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

  // Wrapper function to validate and handle status filter changes
  const handleStatusFilterChange = (value: string) => {
    const validStatuses = ["all", "pending", "in-progress", "designing", "completed", "invoiced", "cancelled"];
    if (validStatuses.includes(value)) {
      onStatusFilterChange(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gaming-glow mb-1 md:mb-2">Job Management</h1>
          <p className="text-xs sm:text-sm md:text-base text-gaming-glow/80">
            Manage and track all your job orders
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gaming-primary w-4 h-4" />
          <Input
            placeholder="Search jobs by title, order number, or customer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background text-foreground border-border placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gaming-secondary" />
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-32 sm:w-40 bg-background text-foreground border-border text-xs sm:text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-background/95">
              <SelectItem value="all">
                <span className="text-gaming-glow">All Status</span>
              </SelectItem>
              {getStatusOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="text-gaming-glow">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
