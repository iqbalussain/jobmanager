
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
  Palette,
  Search,
  Eye,
  User,
  Calendar,
  TrendingUp,
  Activity,
  Plus,
  BarChart3,
  Users,
  Building
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays } from "date-fns";

interface ModernDashboardProps {
  jobs: Job[];
}

export function ModernDashboard({ jobs }: ModernDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const { activities, isLoading: activitiesLoading } = useActivities();

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    working: jobs.filter(job => job.status === "working").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length
  };

  // Generate daily data for the last 7 days
  const generateDailyChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayJobs = jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate.toDateString() === date.toDateString();
      });
      const dayCompleted = jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate.toDateString() === date.toDateString() && 
               ['completed', 'invoiced'].includes(job.status);
      });
      
      data.push({
        day: format(date, 'MMM dd'),
        jobs: dayJobs.length,
        completed: dayCompleted.length
      });
    }
    return data;
  };

  const chartData = generateDailyChartData();

  // Data for the donut chart
  const donutData = [
    { name: 'Completed', value: stats.completed + stats.invoiced, color: '#10B981' },
    { name: 'Working', value: stats.working + stats.designing, color: '#F59E0B' },
    { name: 'Pending', value: stats.pending, color: '#3B82F6' }
  ];

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsOpen(true);
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

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-80 bg-white/80 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-blue-200 text-xs mt-1">All time</p>
              </div>
              <div className="bg-blue-400/30 p-3 rounded-full">
                <Briefcase className="w-8 h-8 text-blue-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Jobs</p>
                <p className="text-3xl font-bold">{stats.working + stats.designing}</p>
                <p className="text-orange-200 text-xs mt-1">In progress</p>
              </div>
              <div className="bg-orange-400/30 p-3 rounded-full">
                <Activity className="w-8 h-8 text-orange-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold">{stats.completed + stats.invoiced}</p>
                <p className="text-green-200 text-xs mt-1">This month</p>
              </div>
              <div className="bg-green-400/30 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
                <p className="text-purple-200 text-xs mt-1">Awaiting action</p>
              </div>
              <div className="bg-purple-400/30 p-3 rounded-full">
                <Clock className="w-8 h-8 text-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Job Trends Chart */}
        <Card className="lg:col-span-2 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Daily Job Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                  name="Total Jobs"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Distribution Donut Chart */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Job Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {donutData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-600">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.user_name}</p>
                      <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400">{getTimeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No recent activities</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Search Results */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Search className="w-5 h-5 text-blue-600" />
              Quick Job Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchQuery ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 truncate">{job.jobOrderNumber} • {job.customer}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs px-2 py-0.5 ${
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
                      className="ml-2"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
                {filteredJobs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No jobs found</p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Start typing to search for jobs...</p>
              </div>
            )}
          </CardContent>
        </Card>
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
