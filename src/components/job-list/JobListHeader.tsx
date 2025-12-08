
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JobListHeaderProps {
  searchQuery: string;
  statusFilter: string;
  dateFilter: { from?: Date; to?: Date } | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onDateFilterChange: (dateFilter: { from?: Date; to?: Date } | null) => void;
}

export function JobListHeader({ 
  searchQuery, 
  statusFilter, 
  dateFilter,
  onSearchChange, 
  onStatusFilterChange,
  onDateFilterChange
}: JobListHeaderProps) {
  const getStatusOptions = () => [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "designing", label: "Designing" },
    { value: "completed", label: "Completed" },
    { value: "invoiced", label: "Invoiced" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const clearDateFilter = () => {
    onDateFilterChange(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Management</h1>
          <p className="text-gray-600">Manage and track all your job orders</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-auto justify-start text-left font-normal bg-white/90",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter?.from ? (
                  dateFilter.to ? (
                    <>
                      {format(dateFilter.from, "LLL dd, y")} -{" "}
                      {format(dateFilter.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateFilter.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateFilter?.from}
                selected={dateFilter ? { from: dateFilter.from, to: dateFilter.to } : undefined}
                onSelect={(range) => {
                  if (range) {
                    onDateFilterChange({
                      from: range.from,
                      to: range.to
                    });
                  } else {
                    onDateFilterChange(null);
                  }
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {dateFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilter}
              className="h-8 px-2 lg:px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search and Status Filter */}
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
    </div>
  );
}
