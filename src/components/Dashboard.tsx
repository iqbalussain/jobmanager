
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { useChartData } from "@/hooks/useChartData";
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
  StickyNote
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardProps {
  jobs: Job[];
}

export function Dashboard({ jobs }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [stickyNote, setStickyNote] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active';
    title: string;
  } | null>(null);

  const { dailyJobData, isLoading: chartLoading } = useChartData();

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    working: jobs.filter(job => job.status === "working").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length
  };

  // Gauge data for pie chart
  const gaugeData = [
    { name: 'Pending', value: stats.pending, color: '#3B82F6' },
    { name: 'Working', value: stats.working, color: '#F59E0B' },
    { name: 'Designing', value: stats.designing, color: '#8B5CF6' },
    { name: 'Completed', value: stats.completed, color: '#10B981' },
    { name: 'Invoiced', value: stats.invoiced, color: '#059669' }
  ];

  // Recent activities data
  const recentActivities = [
    { user: 'John Doe', action: 'Updated job status', time: '2 hours ago', avatar: 'JD' },
    { user: 'Jane Smith', action: 'Created new job order', time: '4 hours ago', avatar: 'JS' },
    { user: 'Mike Johnson', action: 'Completed design phase', time: '6 hours ago', avatar: 'MJ' },
    { user: 'Sarah Wilson', action: 'Added job comments', time: '8 hours ago', avatar: 'SW' }
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

  const handleStatusClick = (status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active', title: string) => {
    setSelectedStatus({ status, title });
    setStatusModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your job orders and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card 
          className="bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
          onClick={() => handleStatusClick('total', 'All')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-100 text-xs font-medium">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Briefcase className="w-6 h-6 text-slate-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
          onClick={() => handleStatusClick('pending', 'Pending')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
          onClick={() => handleStatusClick('working', 'Working')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">Working</p>
                <p className="text-2xl font-bold">{stats.working}</p>
              </div>
              <Activity className="w-6 h-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
          onClick={() => handleStatusClick('designing', 'Designing')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Designing</p>
                <p className="text-2xl font-bold">{stats.designing}</p>
              </div>
              <Palette className="w-6 h-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
          onClick={() => handleStatusClick('completed', 'Completed')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all"
          onClick={() => handleStatusClick('invoiced', 'Invoiced')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium">Invoiced</p>
                <p className="text-2xl font-bold">{stats.invoiced}</p>
              </div>
              <FileText className="w-6 h-6 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Daily Job Creation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyJobData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="jobs" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="Jobs Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gauge Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Activity className="w-5 h-5 text-green-600" />
              Job Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {gaugeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Search Results */}
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(job)}
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
              <p className="text-gray-500 text-center py-8">Start typing to search for jobs...</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities and Sticky Note */}
        <div className="space-y-6">
          {/* Recent Activities */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Activity className="w-5 h-5 text-purple-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sticky Note */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <StickyNote className="w-5 h-5" />
                Personal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your personal notes here..."
                value={stickyNote}
                onChange={(e) => setStickyNote(e.target.value)}
                className="min-h-24 bg-yellow-50 border-yellow-200 focus:border-yellow-400 text-yellow-900 placeholder:text-yellow-600"
              />
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

      {/* Job Status Modal */}
      <JobStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        jobs={jobs}
        status={selectedStatus?.status || 'total'}
        title={selectedStatus?.title || 'All'}
      />
    </div>
  );
}
