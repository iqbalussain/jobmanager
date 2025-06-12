
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Users, 
  Calendar,
  Send,
  User
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Job, JobStatus } from "@/pages/Index";
import { JobStatusModal } from './JobStatusModal';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JobStats {
  status: JobStatus;
  count: number;
  label: string;
  color: string;
}

const jobStatusColors: Record<JobStatus, string> = {
  pending: 'bg-yellow-500',
  working: 'bg-blue-500',
  designing: 'bg-purple-500',
  completed: 'bg-green-500',
  finished: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  invoiced: 'bg-indigo-500',
};

interface ModernDashboardProps {
  jobs: Job[];
  onViewChange?: (view: "dashboard" | "jobs" | "create" | "calendar" | "settings" | "admin" | "admin-management") => void;
}

export function ModernDashboard({ jobs, onViewChange }: ModernDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Admin', message: 'Welcome to the team chat! Share your ideas and collaborate.', timestamp: new Date() },
    { id: 2, user: 'Designer', message: 'Working on the new project designs. Will share updates soon.', timestamp: new Date() }
  ]);

  const jobStats = useMemo(() => {
    const stats = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<JobStatus, number>);
    
    return [
      { status: 'pending', count: stats.pending || 0, label: 'Pending', color: 'bg-yellow-500' },
      { status: 'working', count: stats.working || 0, label: 'Working', color: 'bg-blue-500' },
      { status: 'designing', count: stats.designing || 0, label: 'Designing', color: 'bg-purple-500' },
      { status: 'completed', count: stats.completed || 0, label: 'Completed', color: 'bg-green-500' },
      { status: 'finished', count: stats.finished || 0, label: 'Finished', color: 'bg-emerald-500' },
      { status: 'cancelled', count: stats.cancelled || 0, label: 'Cancelled', color: 'bg-red-500' },
      { status: 'invoiced', count: stats.invoiced || 0, label: 'Invoiced', color: 'bg-indigo-500' }
    ] as const;
  }, [jobs]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayJobs = jobs.filter(job => job.createdAt?.startsWith(date));
      const created = dayJobs.length;
      const completed = dayJobs.filter(job => 
        job.status === 'completed' || job.status === 'finished' || job.status === 'invoiced'
      ).length;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        created,
        completed
      };
    });
  }, [jobs]);

  const salesmanPerformance = useMemo(() => {
    const performance = jobs.reduce((acc, job) => {
      const salesman = job.salesman || 'Unknown';
      if (!acc[salesman]) {
        acc[salesman] = { total: 0, completed: 0 };
      }
      acc[salesman].total += 1;
      if (['completed', 'finished', 'invoiced'].includes(job.status)) {
        acc[salesman].completed += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    return Object.entries(performance).map(([name, stats]) => ({
      name,
      total: stats.total,
      completed: stats.completed,
      percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));
  }, [jobs]);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobOrderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusClick = (status: JobStatus, label: string) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        user: 'You',
        message: chatMessage.trim(),
        timestamp: new Date()
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your job overview.</p>
        </div>
        <Button 
          onClick={() => onViewChange?.('create')} 
          className="flex items-center gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Create Job
        </Button>
      </div>

      {/* Top Row - Job Status, Salesman Performance, Quick Search */}
      <div className="grid grid-cols-12 gap-6">
        {/* Job Status Overview - 25% width, increased height */}
        <Card className="col-span-3 h-80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Job Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobStats.map((stat) => (
              <div 
                key={stat.status}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => handleStatusClick(stat.status as JobStatus, stat.label)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <span className="font-medium text-sm">{stat.label}</span>
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {stat.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Salesman Performance - 60% width */}
        <Card className="col-span-7 h-80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Salesman Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-56">
              <div className="space-y-4">
                {salesmanPerformance.map((salesman) => (
                  <div key={salesman.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{salesman.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{salesman.percentage}%</div>
                        <div className="text-xs text-muted-foreground">
                          {salesman.completed}/{salesman.total} completed
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${salesman.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Search - 15% width */}
        <Card className="col-span-2 h-80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-4 h-4" />
              Quick Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {filteredJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-2 rounded border text-xs">
                    <div className="font-medium truncate">{job.title}</div>
                    <div className="text-muted-foreground truncate">{job.customer}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Chart and Chat */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily Job Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Daily Job Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#ffffff"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
                    name="Created"
                    filter="drop-shadow(0 0 6px #22C55E)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#FDE047"
                    strokeWidth={3}
                    dot={{ fill: '#FDE047', strokeWidth: 2, r: 4 }}
                    name="Completed"
                    filter="drop-shadow(0 0 6px #FDE047)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Chat Box */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Team Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-64">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{msg.user}</span>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-accent p-2 rounded-lg text-sm">
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 min-h-[60px] resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                size="sm"
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">Customer: {job.customer}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={getStatusVariant(job.status)}
                    className="mb-1"
                  >
                    {job.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">#{job.jobOrderNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Status Modal */}
      <JobStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobs={jobs}
        status={selectedStatus!}
        title={jobStats.find(s => s.status === selectedStatus)?.label || ''}
      />
    </div>
  );
}

function getStatusVariant(status: JobStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'completed':
    case 'finished':
    case 'invoiced':
      return 'default';
    case 'working':
    case 'designing':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}
