
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
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 text-white text-base lg:text-lg">
          <Search className="w-5 h-5" />
          Quick Search
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-6 px-6 flex-1 flex flex-col overflow-hidden">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors text-base"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {searchQuery ? (
            <div className="space-y-3">
              {filteredJobs.slice(0, 6).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold text-sm truncate text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-500 truncate">{job.jobOrderNumber}</p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(job)}
                      className="p-2 h-8 w-8 rounded-full border-blue-200 hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <p className="text-gray-500 text-center py-8 text-base">No jobs found</p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-base">Start typing to search...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
