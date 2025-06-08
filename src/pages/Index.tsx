
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { JobForm } from "@/components/JobForm";
import { JobList } from "@/components/JobList";
import { SidebarProvider } from "@/components/ui/sidebar";

export type JobStatus = "pending" | "in-progress" | "completed" | "cancelled" | "designing" | "finished" | "overdue";

export interface Job {
  id: string;
  jobOrderNumber: string;
  title: string;
  description: string;
  customer: string;
  assignee: string;
  priority: "low" | "medium" | "high";
  status: JobStatus;
  dueDate: string;
  createdAt: string;
  estimatedHours: number;
  branch: string;
  designer: string;
  salesman: string;
  jobOrderDetails: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "jobs" | "create">("dashboard");
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      jobOrderNumber: "WK000001",
      title: "HVAC System Maintenance",
      description: "Annual maintenance check for commercial HVAC system",
      customer: "ABC Corporation",
      assignee: "John Smith",
      priority: "high",
      status: "in-progress",
      dueDate: "2024-06-15",
      createdAt: "2024-06-08",
      estimatedHours: 4,
      branch: "Wadi Kabeer",
      designer: "Alice Johnson",
      salesman: "Emma Brown",
      jobOrderDetails: "Complete maintenance check including filter replacement and system calibration"
    },
    {
      id: "2",
      jobOrderNumber: "HO000001",
      title: "Plumbing Repair",
      description: "Fix leaking pipes in office building basement",
      customer: "XYZ Industries",
      assignee: "Sarah Johnson",
      priority: "medium",
      status: "designing",
      dueDate: "2024-06-12",
      createdAt: "2024-06-07",
      estimatedHours: 2,
      branch: "Head Office",
      designer: "Bob Smith",
      salesman: "Frank Miller",
      jobOrderDetails: "Emergency plumbing repair for basement flooding issue"
    },
    {
      id: "3",
      jobOrderNumber: "WK000002",
      title: "Electrical Installation",
      description: "Install new lighting system in warehouse",
      customer: "Tech Solutions Ltd",
      assignee: "Mike Davis",
      priority: "low",
      status: "finished",
      dueDate: "2024-06-10",
      createdAt: "2024-06-05",
      estimatedHours: 6,
      branch: "Wadi Kabeer",
      designer: "Carol Davis",
      salesman: "Grace Lee",
      jobOrderDetails: "Full warehouse lighting upgrade with LED fixtures"
    }
  ]);

  const generateJobOrderNumber = (branch: string) => {
    const prefix = branch === "Wadi Kabeer" ? "WK" : "HO";
    const branchJobs = jobs.filter(job => job.branch === branch);
    const nextNumber = branchJobs.length + 1;
    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  };

  const addJob = (job: Omit<Job, "id" | "createdAt" | "jobOrderNumber">) => {
    const jobOrderNumber = generateJobOrderNumber(job.branch);
    const newJob: Job = {
      ...job,
      id: Date.now().toString(),
      jobOrderNumber,
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
