
import { useState, useEffect, useRef } from "react";
import { Job } from "@/pages/Index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobDetails } from "@/components/JobDetails";
import { 
  Calendar,
  User,
  Building,
  ChevronRight,
  Eye,
  Edit,
  FileText
} from "lucide-react";

interface CardStackSliderProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, status: any) => void;
}

export function CardStackSlider({ jobs, onStatusUpdate }: CardStackSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter jobs to show only pending jobs
  const pendingJobs = jobs.filter(job => job.status === "pending");
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 0 && currentIndex < pendingJobs.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [currentIndex, pendingJobs.length]);

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
    setIsEditMode(false);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsOpen(true);
    setIsEditMode(true);
  };

  const getCardTransform = (index: number) => {
    const offset = index - currentIndex;
    const scale = Math.max(0.8, 1 - Math.abs(offset) * 0.1);
    const translateY = offset * 20;
    const translateZ = -Math.abs(offset) * 100;
    const rotateX = offset * 5;
    
    return {
      transform: `perspective(1000px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
      zIndex: pendingJobs.length - Math.abs(offset),
      opacity: Math.max(0.3, 1 - Math.abs(offset) * 0.3)
    };
  };

  if (pendingJobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Job Orders</h1>
          <p className="text-gray-600">Today: {currentDate}</p>
        </div>
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Job Orders</h3>
            <p className="text-gray-500">All job orders are up to date!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Job Orders</h1>
        <p className="text-gray-600">Today: {currentDate}</p>
        <p className="text-sm text-gray-500 mt-2">Scroll with mouse wheel to navigate • {pendingJobs.length} pending jobs</p>
      </div>

      <div 
        ref={containerRef}
        className="relative h-[600px] w-full max-w-2xl mx-auto"
        style={{ perspective: '1000px' }}
      >
        {pendingJobs.map((job, index) => (
          <Card
            key={job.id}
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-0 shadow-2xl transition-all duration-500 ease-out cursor-pointer"
            style={getCardTransform(index)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 rounded-lg" />
            
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="w-3 h-3" />
                  <span className="font-medium">{job.jobOrderNumber}</span>
                </div>
                <div className="flex gap-1">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-1 shadow-sm">
                    {job.priority}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-1 shadow-sm">
                    pending
                  </Badge>
                </div>
              </div>
              
              <CardTitle className="text-xl text-gray-900 line-clamp-2 leading-tight mb-2">
                {job.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0 relative z-10">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{job.customer}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Salesman: {job.salesman}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-200/50">
                <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                <span>{job.estimatedHours}h estimated</span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleViewDetails(job)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all text-xs shadow-sm"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                
                <Button
                  onClick={() => handleEditJob(job)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all text-xs shadow-sm"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>

              <Button
                onClick={() => onStatusUpdate(job.id, 'working')}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs transform hover:scale-105"
                size="sm"
              >
                Start Working
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-6">
        {pendingJobs.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-blue-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      <JobDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={selectedJob}
        isEditMode={isEditMode}
      />
    </div>
  );
}
