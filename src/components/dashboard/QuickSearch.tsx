
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Eye, MessageSquare } from "lucide-react";

interface QuickSearchProps {
  searchQuery: string;
  filteredJobs: Job[];
  onViewDetails: (job: Job) => void;
}

export function QuickSearch({ searchQuery, filteredJobs, onViewDetails }: QuickSearchProps) {
  const [chatJob, setChatJob] = useState<Job | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatClick = (job: Job) => {
    setChatJob(job);
    setIsChatOpen(true);
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
          <Search className="w-5 h-5 text-blue-600" />
          Quick Search
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {searchQuery ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredJobs.slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{job.title}</p>
                  <p className="text-sm text-gray-500 truncate">{job.jobOrderNumber}</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleChatClick(job)}
                    className="p-2"
                  >
                    <MessageSquare className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(job)}
                    className="p-2"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm">No jobs found</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Start typing to search...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
