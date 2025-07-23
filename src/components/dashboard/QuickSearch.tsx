
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, MessageSquare } from "lucide-react";

interface QuickSearchProps {
  searchQuery: string;
  filteredJobs: Job[];
  onViewDetails: (job: Job) => void;
  onSearchChange: (query: string) => void;
}

export function QuickSearch({ searchQuery, filteredJobs, onViewDetails, onSearchChange }: QuickSearchProps) {
  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 h-full flex flex-col rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Search className="w-4 h-4" />
          Quick Search
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col overflow-hidden">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {searchQuery ? (
            <div className="space-y-2">
              {filteredJobs.slice(0, 6).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500 truncate">{job.jobOrderNumber}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(job)}
                      className="p-1 h-6 w-6 rounded-full border-blue-200 hover:bg-blue-100"
                    >
                      <Eye className="w-3 h-3 text-blue-600" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <p className="text-gray-500 text-center py-4 text-xs">No jobs found</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 flex-1 flex flex-col justify-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">Start typing to search...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
