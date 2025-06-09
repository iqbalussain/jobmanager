
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Job } from "@/pages/Index";
import { JobChat } from "@/components/JobChat";

interface CalendarViewProps {
  jobs: Job[];
}

export function CalendarView({ jobs }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedJobForChat, setSelectedJobForChat] = useState<Job | null>(null);

  // Get jobs for the selected date - fix date comparison
  const getJobsForDate = (date: Date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return jobs.filter(job => {
      // Handle different date formats
      const jobDate = job.dueDate.includes('T') 
        ? job.dueDate.split('T')[0] 
        : job.dueDate;
      return jobDate === dateString;
    });
  };

  const selectedDateJobs = selectedDate ? getJobsForDate(selectedDate) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Create date modifiers to highlight dates with jobs
  const getDateModifiers = () => {
    const datesWithJobs = jobs.map(job => {
      const jobDate = job.dueDate.includes('T') 
        ? job.dueDate.split('T')[0] 
        : job.dueDate;
      return new Date(jobDate);
    });
    
    return {
      hasJobs: datesWithJobs
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">View and manage job schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={getDateModifiers()}
              modifiersStyles={{
                hasJobs: { 
                  backgroundColor: '#dbeafe', 
                  color: '#1e40af',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 text-sm text-gray-600">
              <p>• Dates with jobs are highlighted in blue</p>
              <p>• Total jobs: {jobs.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Jobs for {selectedDate?.toLocaleDateString() || 'Selected Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No jobs scheduled for this date
              </p>
            ) : (
              <div className="space-y-4">
                {selectedDateJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{job.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.customer}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.estimatedHours}h estimated</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedJobForChat(job)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedJobForChat && (
        <JobChat
          job={selectedJobForChat}
          isOpen={!!selectedJobForChat}
          onClose={() => setSelectedJobForChat(null)}
        />
      )}
    </div>
  );
}
