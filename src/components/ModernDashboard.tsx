
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { JobStatusModal } from "@/components/JobStatusModal";
import { JobChat } from "@/components/JobChat";
import { useActivities } from "@/hooks/useActivities";
import { useChartData } from "@/hooks/useChartData";
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
  BanIcon,
  MessageSquare,
  Bell,
  Send
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ResponsiveContainer as ResponsiveContainer2 } from "recharts";
import { format, subDays } from "date-fns";

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: "dashboard" | "jobs" | "create" | "calendar" | "settings" | "admin" | "admin-management") => void;
}

export function ModernDashboard({ jobs, onViewChange }: ModernDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active';
    title: string;
  } | null>(null);
  const [chatJob, setChatJob] = useState<Job | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, time: string}>>([
    {id: '1', user: 'John Doe', message: 'Hey, can we discuss the logo design for Project Alpha?', time: '10:30 AM'},
    {id: '2', user: 'Sarah Smith', message: 'The client wants to modify the color scheme', time: '11:15 AM'},
  ]);
  const [notifications, setNotifications] = useState([
    {id: '1', type: 'job_created', message: 'New job "Website Design" created by John Doe', time: '2 hours ago', read: false},
    {id: '2', type: 'status_change', message: 'Job "Logo Design" status changed to Working', time: '3 hours ago', read: false},
    {id: '3', type: 'chat', message: 'New message in "Project Alpha" chat', time: '1 hour ago', read: true},
  ]);

  const { activities, isLoading: activitiesLoading } = useActivities();
  const { dailyJobData, isLoading: chartLoading } = useChartData();

  const stats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === "pending").length,
    working: jobs.filter(job => job.status === "working").length,
    designing: jobs.filter(job => job.status === "designing").length,
    completed: jobs.filter(job => job.status === "completed").length,
    invoiced: jobs.filter(job => job.status === "invoiced").length,
    cancelled: jobs.filter(job => job.status === "cancelled").length
  };

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

  const handleStatusClick = (status: 'pending' | 'working' | 'designing' | 'completed' | 'invoiced' | 'total' | 'active', title: string) => {
    setSelectedStatus({ status, title });
    setStatusModalOpen(true);
  };

  const handleCreateJobClick = () => {
    if (onViewChange) {
      onViewChange("create");
    }
  };

  const handleChatClick = (job: Job) => {
    setChatJob(job);
    setIsChatOpen(true);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        user: 'You',
        message: chatMessage.trim(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
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
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button 
            onClick={handleCreateJobClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Top Row - Job Status (20%) + Salesman Performance (60%) + Quick Search (20%) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Left - Job Status Cards (20% width) - REDUCED SIZE */}
        <div className="col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Job Status</h3>
          <div className="grid grid-cols-1 gap-2">
            <Card 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-blue-500/50"
              onClick={() => handleStatusClick('total', 'All')}
            >
              <CardContent className="p-2 flex items-center justify-center text-center">
                <div>
                  <Briefcase className="w-4 h-4 text-blue-200 mb-1 mx-auto" />
                  <p className="text-blue-100 text-xs font-medium mb-1">Total</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-orange-500/50"
              onClick={() => handleStatusClick('active', 'Active')}
            >
              <CardContent className="p-2 flex items-center justify-center text-center">
                <div>
                  <Activity className="w-4 h-4 text-orange-200 mb-1 mx-auto" />
                  <p className="text-orange-100 text-xs font-medium mb-1">Active</p>
                  <p className="text-lg font-bold">{stats.working + stats.designing}</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-purple-500/50"
              onClick={() => handleStatusClick('pending', 'Pending')}
            >
              <CardContent className="p-2 flex items-center justify-center text-center">
                <div>
                  <Clock className="w-4 h-4 text-purple-200 mb-1 mx-auto" />
                  <p className="text-purple-100 text-xs font-medium mb-1">Pending</p>
                  <p className="text-lg font-bold">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-green-500/50"
              onClick={() => handleStatusClick('completed', 'Completed')}
            >
              <CardContent className="p-2 flex items-center justify-center text-center">
                <div>
                  <CheckCircle className="w-4 h-4 text-green-200 mb-1 mx-auto" />
                  <p className="text-green-100 text-xs font-medium mb-1">Done</p>
                  <p className="text-lg font-bold">{stats.completed}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Center - Salesman Performance Circular Sliders (60% width) */}
        <div className="col-span-8">
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

        {/* Top Right - Quick Search (20% width) */}
        <div className="col-span-2">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
                <Search className="w-4 h-4 text-blue-600" />
                Quick Search
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {searchQuery ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{job.title}</p>
                        <p className="text-xs text-gray-500 truncate">{job.jobOrderNumber}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChatClick(job)}
                          className="p-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(job)}
                          className="p-1"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredJobs.length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-xs">No jobs found</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">Start typing...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Row - Daily Job Trends Chart (100% width) */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-900 to-violet-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-yellow-400" />
              Daily Job Creation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-white">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyJobData}>
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
                    dataKey="jobs" 
                    stroke="#FEF08A" 
                    strokeWidth={4}
                    dot={{ fill: '#FEF08A', strokeWidth: 3, r: 6 }}
                    name="Created Jobs"
                    style={{
                      filter: 'drop-shadow(0 0 8px #FEF08A)',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Recent Activities (25%) + Chat Box (75%) */}
      <div className="grid grid-cols-4 gap-6">
        {/* Recent Activities - 25% width */}
        <div className="col-span-1">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">{activity.user_name}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.created_at)}</p>
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
        </div>

        {/* Chat Box - 75% width */}
        <div className="col-span-3">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Team Chat & Job Discussions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-80">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      msg.user === 'You' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${msg.user === 'You' ? 'text-blue-100' : 'text-gray-700'}`}>
                          {msg.user}
                        </span>
                        <span className={`text-xs ${msg.user === 'You' ? 'text-blue-200' : 'text-gray-500'}`}>
                          {msg.time}
                        </span>
                      </div>
                      <p className={`text-sm ${msg.user === 'You' ? 'text-white' : 'text-gray-900'}`}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message about jobs or general discussion..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
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

      {/* Job Status Modal */}
      <JobStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        jobs={jobs}
        status={selectedStatus?.status || 'total'}
        title={selectedStatus?.title || 'All'}
      />

      {/* Job Chat Modal */}
      {chatJob && (
        <JobChat
          job={chatJob}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
