
import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfileDropdown } from '@/components/user-profile/UserProfileDropdown';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface MinimalistSidebarProps {
  currentView: string;
  onViewChange: (view: "jobs" | "create" | "unapproved-jobs" | "approved-jobs" | "branch-queue") => void;
}

interface UserProfile {
  full_name: string;
  role: string;
}

export function MinimalistSidebar({ currentView, onViewChange }: MinimalistSidebarProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isJobManagementExpanded, setIsJobManagementExpanded] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Expand job management section if we're in unapproved or approved jobs view
  useEffect(() => {
    if (currentView === 'unapproved-jobs' || currentView === 'approved-jobs') {
      setIsJobManagementExpanded(true);
    }
  }, [currentView]);

  const handleJobManagementToggle = () => {
    setIsJobManagementExpanded(!isJobManagementExpanded);
  };

  const handleJobManagementItemClick = (viewId: "unapproved-jobs" | "approved-jobs") => {
    onViewChange(viewId);
    setIsJobManagementExpanded(true);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">JobFlow</h1>
        <p className="text-sm text-gray-500 mt-1">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Jobs */}
        <Button
          variant={currentView === "jobs" ? "default" : "ghost"}
          className={`w-full justify-start text-left ${
            currentView === "jobs" 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => onViewChange("jobs")}
        >
          <Briefcase className="w-4 h-4 mr-3" />
          <span>Jobs</span>
        </Button>

        {/* Create Job */}
        <Button
          variant={currentView === "create" ? "default" : "ghost"}
          className={`w-full justify-start text-left ${
            currentView === "create" 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => onViewChange("create")}
        >
          <Plus className="w-4 h-4 mr-3" />
          <span>Create Job</span>
        </Button>

        {/* Job Management Section */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={handleJobManagementToggle}
          >
            {isJobManagementExpanded ? (
              <ChevronDown className="w-4 h-4 mr-3" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-3" />
            )}
            <span>Job Management</span>
          </Button>
          
          {isJobManagementExpanded && (
            <div className="ml-6 space-y-1">
              <Button
                variant={currentView === "unapproved-jobs" ? "default" : "ghost"}
                className={`w-full justify-start text-left ${
                  currentView === "unapproved-jobs" 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => handleJobManagementItemClick("unapproved-jobs")}
              >
                <Clock className="w-4 h-4 mr-3" />
                <span>Unapproved Jobs</span>
              </Button>
              
              <Button
                variant={currentView === "approved-jobs" ? "default" : "ghost"}
                className={`w-full justify-start text-left ${
                  currentView === "approved-jobs" 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => handleJobManagementItemClick("approved-jobs")}
              >
                <CheckCircle className="w-4 h-4 mr-3" />
                <span>Approved Jobs</span>
              </Button>
            </div>
          )}
        </div>

        {/* Branch Queue */}
        <Button
          variant={currentView === "branch-queue" ? "default" : "ghost"}
          className={`w-full justify-start text-left ${
            currentView === "branch-queue" 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => onViewChange("branch-queue")}
        >
          <Building2 className="w-4 h-4 mr-3" />
          <span>Branch Queue</span>
        </Button>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <UserProfileDropdown userProfile={userProfile} />
      </div>
    </div>
  );
}
