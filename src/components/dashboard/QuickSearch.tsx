
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Eye, MessageSquare } from "lucide-react";
import { JobChat } from "@/components/JobChat";

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
    <>
      <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Search className="w-5 h-5 text-blue-600" />
            Quick Job Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          {searchQuery ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.jobOrderNumber} • {job.customer}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChatClick(job)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(job)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No jobs found</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Start typing to search for jobs...</p>
          )}
        </CardContent>
      </Card>

      {chatJob && (
        <JobChat
          job={chatJob}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
