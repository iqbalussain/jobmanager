
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { useActivities } from "@/hooks/useActivities";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  FileText,
  Search,
  Eye,
  User,
  Activity,
  Plus,
  Users,
  Building,
  X,
  BanIcon
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ResponsiveContainer as ResponsiveContainer2 } from "recharts";
import { format, subDays } from "date-fns";

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: string) => void;
}

export function ModernDashboard({ jobs, onViewChange }: ModernDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [stickyNotes, setStickyNotes] = useState([
    { id: 1, content: "Follow up with client about design approval", color: "bg-yellow-200" },
    { id: 2, content: "Team meeting at 3 PM", color: "bg-blue-200" },
    { id: 3, content: "Update project timeline", color: "bg-pink-200" }
  ]);
  const [newNote, setNewNote] = useState("");
  const { activities, isLoading: activitiesLoading } = useActivities();

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    working: jobs.filter(job => job.status === "working").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length,
    cancelled: jobs.filter(job => job.status === "cancelled").length
  };

  // Generate daily data for the last 7 days with created and completed jobs
  const generateDailyChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayCreated = jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate.toDateString() === date.toDateString();
      });
      const dayCompleted = jobs.filter(job => {
        // For completed, we'll use a simulated completion date
        const jobDate = new Date(job.createdAt);
        const completionDate = new Date(jobDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        return completionDate.toDateString() === date.toDateString() && 
               ['completed', 'invoiced'].includes(job.status);
      });
      
      data.push({
        day: format(date, 'MMM dd'),
        created: dayCreated.length,
        completed: dayCompleted.length
      });
    }
    return data;
  };

  const chartData = generateDailyChartData();

  // Get salesman job distribution for performance circular slider
  const salesmanData = jobs.reduce((acc, job) => {
    const salesman = job.salesman || 'Unassigned';
    acc[salesman] = (acc[salesman] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Create performance data for circular sliders - show all salesmen
  const performanceData = Object.entries(salesmanData).map(([name, count], index) => {
    const completionRate = Math.round((Math.random() * 40) + 60); // Simulated completion rate 60-100%
    const efficiency = Math.round((Math.random() * 30) + 70); // Simulated efficiency 70-100%
    
    return {
      id: index,
      name,
      jobCount: count,
      completionRate,
      efficiency,
      color: `hsl(${index * 72}, 70%, 60%)` // Different colors for each salesman
    };
  });

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    if (onViewChange) {
      onViewChange("jobs");
    }
  };

  const handleCreateJobClick = () => {
    if (onViewChange) {
      onViewChange("create");
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="w-4 h-4 text-blue-500" />;
      case 'status_updated': return <Activity className="w-4 h-4 text-green-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const addStickyNote = () => {
    if (newNote.trim()) {
      const colors = ["bg-yellow-200", "bg-blue-200", "bg-pink-200", "bg-green-200", "bg-purple-200"];
      setStickyNotes([...stickyNotes, {
        id: Date.now(),
        content: newNote,
        color: colors[Math.floor(Math.random() * colors.length)]
      }]);
      setNewNote("");
    }
  };

  const removeStickyNote = (id: number) => {
    setStickyNotes(stickyNotes.filter(note => note.id !== id));
  };

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 60, strokeWidth = 4, color }: { 
    percentage: number; 
    size?: number; 
    strokeWidth?: number; 
    color: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <Button 
          onClick={handleCreateJobClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Top Row - Job Status (25%) + Salesman Performance (60%) + Quick Search (15%) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Left - Job Status Cards (25% width) */}
        <div className="col-span-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:shadow-blue-500/50"
              onClick={() => handleStatusClick('total')}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-medium">Total Jobs</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                  <Briefcase className="w-5 h-5 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:shadow-orange-500/50"
              onClick={() => handleStatusClick('active')}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs font-medium">Active</p>
                    <p className="text-xl font-bold">{stats.working + stats.designing}</p>
                  </div>
                  <Activity className="w-5 h-5 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:shadow-purple-500/50"
              onClick={() => handleStatusClick('pending')}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs font-medium">Pending</p>
                    <p className="text-xl font-bold">{stats.pending}</p>
                  </div>
                  <Clock className="w-5 h-5 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:shadow-green-500/50"
              onClick={() => handleStatusClick('completed')}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs font-medium">Completed</p>
                    <p className="text-xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:shadow-emerald-500/50"
              onClick={() => handleStatusClick('invoiced')}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs font-medium">Invoiced</p>
                    <p className="text-xl font-bold">{stats.invoiced}</p>
                  </div>
                  <FileText className="w-5 h-5 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:shadow-red-500/50"
              onClick={() => handleStatusClick('cancelled')}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs font-medium">Cancelled</p>
                    <p className="text-xl font-bold">{stats.cancelled}</p>
                  </div>
                  <BanIcon className="w-5 h-5 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Center - Salesman Performance Circular Sliders (60% width) */}
        <div className="col-span-7">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
                <Users className="w-5 h-5 text-blue-600" />
                Salesman Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-4 gap-3">
                {performanceData.map((salesman) => (
                  <div key={salesman.id} className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-medium text-gray-700 truncate w-full text-center">
                      {salesman.name}
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex flex-col items-center">
                        <CircularProgress 
                          percentage={salesman.completionRate} 
                          size={45} 
                          strokeWidth={3}
                          color={salesman.color}
                        />
                        <span className="text-xs text-gray-500 mt-1">Complete</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <CircularProgress 
                          percentage={salesman.efficiency} 
                          size={45} 
                          strokeWidth={3}
                          color="#10B981"
                        />
                        <span className="text-xs text-gray-500 mt-1">Efficiency</span>
                      </div>
                    </div>
                    <div className="text-xs text-center">
                      <span className="font-semibold">{salesman.jobCount}</span> jobs
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Right - Quick Search (15% width) */}
        <div className="col-span-2">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
                <Search className="w-5 h-5 text-blue-600" />
                Quick Job Search
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {searchQuery ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {filteredJobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{job.title}</p>
                        <p className="text-xs text-gray-500 truncate">{job.jobOrderNumber} • {job.customer}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs px-1 py-0.5 ${
                            job.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'working' ? 'bg-orange-100 text-orange-800' :
                            job.status === 'designing' ? 'bg-purple-100 text-purple-800' :
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(job)}
                        className="ml-2 p-1"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {filteredJobs.length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">No jobs found</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Start typing to search...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row - Daily Job Trends (50%) + Recent Activities & Sticky Notes (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Job Trends Chart - 50% width */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-900 to-violet-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-yellow-400" />
              Daily Job Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8B5CF6" />
                <XAxis dataKey="day" stroke="#E5E7EB" />
                <YAxis stroke="#E5E7EB" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#581C87', 
                    border: '1px solid #8B5CF6',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    color: '#F9FAFB'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#FEF08A" 
                  strokeWidth={4}
                  dot={{ fill: '#FEF08A', strokeWidth: 3, r: 6 }}
                  name="Created Jobs"
                  style={{
                    filter: 'drop-shadow(0 0 8px #FEF08A)',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#FDE047" 
                  strokeWidth={4}
                  dot={{ fill: '#FDE047', strokeWidth: 3, r: 6 }}
                  name="Completed Jobs"
                  style={{
                    filter: 'drop-shadow(0 0 8px #FDE047)',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right Column - Recent Activities + Sticky Notes Side by Side */}
        <div className="grid grid-cols-2 gap-3 h-full">
          {/* Recent Activities - Portrait Layout */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
                <Activity className="w-4 h-4 text-purple-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {activitiesLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-2 animate-pulse">
                      <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {activities.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{activity.user_name}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-400">{getTimeAgo(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-gray-500 text-center py-6 text-xs">No recent activities</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sticky Notes - Portrait Layout */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
                <FileText className="w-4 h-4 text-yellow-600" />
                Sticky Notes
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && addStickyNote()}
                />
                <Button size="sm" onClick={addStickyNote} className="px-2">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stickyNotes.map((note) => (
                  <div key={note.id} className={`p-2 rounded-lg ${note.color} relative group`}>
                    <p className="text-xs text-gray-800 pr-5">{note.content}</p>
                    <button
                      onClick={() => removeStickyNote(note.id)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                ))}
                {stickyNotes.length === 0 && (
                  <p className="text-gray-500 text-center py-6 text-xs">No notes yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetails
        isOpen={isJobDetailsOpen}
        onClose={() => setIsJobDetailsOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}
