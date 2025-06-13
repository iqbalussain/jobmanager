
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";

interface CalendarViewProps {
  jobs: Job[];
}

export function CalendarView({ jobs }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get jobs for the selected date
  const jobsForDate = jobs.filter(job => {
    const jobDate = new Date(job.dueDate);
    return isSameDay(jobDate, selectedDate);
  });

  // Get dates that have jobs
  const datesWithJobs = jobs.map(job => new Date(job.dueDate));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800";
      case "working": return "bg-orange-100 text-orange-800";
      case "designing": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "invoiced": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar View</h1>
        <p className="text-gray-600">View job schedules and deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Job Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                hasJobs: datesWithJobs
              }}
              modifiersStyles={{
                hasJobs: { backgroundColor: '#dbeafe', fontWeight: 'bold' }
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              Jobs for {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobsForDate.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No jobs scheduled for this date</p>
            ) : (
              <div className="space-y-4">
                {jobsForDate.map((job) => (
                  <div key={job.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{job.title}</h3>
                      <div className="flex gap-1 ml-2">
                        <Badge className={getPriorityColor(job.priority) + " text-xs"}>
                          {job.priority}
                        </Badge>
                        <Badge className={getStatusColor(job.status) + " text-xs"}>
                          {job.status === 'working' ? 'Working' : job.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{job.customer}</p>
                    <div className="text-xs text-gray-500">
                      <span>Assignee: {job.assignee || 'Unassigned'}</span>
                      {job.estimatedHours && (
                        <span className="ml-4">{job.estimatedHours}h estimated</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
