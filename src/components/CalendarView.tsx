
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  MapPin, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { Job } from "@/pages/Index";
import { JobChat } from "@/components/JobChat";

interface CalendarViewProps {
  jobs: Job[];
}

export function CalendarView({ jobs }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedJobForChat, setSelectedJobForChat] = useState<Job | null>(null);

  // Get jobs for the selected date
  const getJobsForDate = (date: Date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return jobs.filter(job => {
      const jobDate = job.dueDate.includes('T') 
        ? job.dueDate.split('T')[0] 
        : job.dueDate;
      return jobDate === dateString;
    });
  };

  const selectedDateJobs = selectedDate ? getJobsForDate(selectedDate) : [];

  // Analytics calculations
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(job => job.status === 'completed' || job.status === 'finished').length;
  const inProgressJobs = jobs.filter(job => job.status === 'in-progress' || job.status === 'designing').length;
  const overdueJobs = jobs.filter(job => {
    const dueDate = new Date(job.dueDate);
    const today = new Date();
    return dueDate < today && job.status !== 'completed' && job.status !== 'finished';
  }).length;

  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  // Upcoming deadlines (next 7 days)
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return jobs.filter(job => {
      const dueDate = new Date(job.dueDate);
      return dueDate >= today && dueDate <= nextWeek && job.status !== 'completed' && job.status !== 'finished';
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  // Priority distribution
  const getPriorityStats = () => {
    const highPriority = jobs.filter(job => job.priority === 'high').length;
    const mediumPriority = jobs.filter(job => job.priority === 'medium').length;
    const lowPriority = jobs.filter(job => job.priority === 'low').length;
    
    return { high: highPriority, medium: mediumPriority, low: lowPriority };
  };

  const priorityStats = getPriorityStats();

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
      case 'finished': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'designing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          Project Dashboard
        </h1>
        <p className="text-gray-600 mt-2">View schedules, analytics, and manage deadlines</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressJobs}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueJobs}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Schedule
            </CardTitle>
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
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>• Dates with jobs are highlighted in blue</p>
              <p>• Click a date to see scheduled jobs</p>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Jobs & Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Jobs for {selectedDate?.toLocaleDateString() || 'Selected Date'}</span>
              <Badge variant="outline" className="ml-2">
                {selectedDateJobs.length} jobs
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateJobs.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No jobs scheduled for this date</p>
                <p className="text-sm text-gray-400 mt-1">Select a highlighted date to see scheduled jobs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.customer}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.estimatedHours}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{job.assignee || 'Unassigned'}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedJobForChat(job)}
                        className="ml-2"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-gray-600">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{inProgressJobs}</p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{overdueJobs}</p>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map((job) => {
                  const daysUntilDue = Math.ceil((new Date(job.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-gray-600">{job.customer}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={daysUntilDue <= 1 ? 'border-red-300 text-red-700' : 'border-yellow-300 text-yellow-700'}
                        >
                          {daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue} days`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
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
