
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { JobForm } from "@/components/JobForm";
import { JobList } from "@/components/JobList";
import { SidebarProvider } from "@/components/ui/sidebar";

export type JobStatus = "pending" | "in-progress" | "completed" | "cancelled";

export interface Job {
  id: string;
  title: string;
  description: string;
  client: string;
  assignee: string;
  priority: "low" | "medium" | "high";
  status: JobStatus;
  dueDate: string;
  createdAt: string;
  estimatedHours: number;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "jobs" | "create">("dashboard");
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      title: "HVAC System Maintenance",
      description: "Annual maintenance check for commercial HVAC system",
      client: "ABC Corporation",
      assignee: "John Smith",
      priority: "high",
      status: "in-progress",
      dueDate: "2024-06-15",
      createdAt: "2024-06-08",
      estimatedHours: 4
    },
    {
      id: "2",
      title: "Plumbing Repair",
      description: "Fix leaking pipes in office building basement",
      client: "XYZ Industries",
      assignee: "Sarah Johnson",
      priority: "medium",
      status: "pending",
      dueDate: "2024-06-12",
      createdAt: "2024-06-07",
      estimatedHours: 2
    },
    {
      id: "3",
      title: "Electrical Installation",
      description: "Install new lighting system in warehouse",
      client: "Tech Solutions Ltd",
      assignee: "Mike Davis",
      priority: "low",
      status: "completed",
      dueDate: "2024-06-10",
      createdAt: "2024-06-05",
      estimatedHours: 6
    }
  ]);

  const addJob = (job: Omit<Job, "id" | "createdAt">) => {
    const newJob: Job = {
      ...job,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setJobs([newJob, ...jobs]);
    setCurrentView("jobs");
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status } : job
    ));
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard jobs={jobs} />;
      case "jobs":
        return <JobList jobs={jobs} onStatusUpdate={updateJobStatus} />;
      case "create":
        return <JobForm onSubmit={addJob} onCancel={() => setCurrentView("dashboard")} />;
      default:
        return <Dashboard jobs={jobs} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
