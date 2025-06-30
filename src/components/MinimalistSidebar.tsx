
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Briefcase, 
  Plus, 
  Settings, 
  Shield, 
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserProfileDropdown } from '@/components/user-profile/UserProfileDropdown';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface MinimalistSidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "create" | "settings" | "admin" | "admin-management" | "reports" | "unapproved-jobs" | "approved-jobs") => void;
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

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'manager';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      badge: null,
    },
    {
      id: 'create',
      label: 'Create Job',
      icon: Plus,
      badge: null,
    },
  ];

  const adminItems = [
    {
      id: 'admin',
      label: 'Admin Jobs',
      icon: Shield,
      badge: null,
    },
    {
      id: 'admin-management',
      label: 'User Management',
      icon: Users,
      badge: null,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      badge: null,
    },
  ];

  const jobManagementItems = [
    {
      id: 'unapproved-jobs',
      label: 'Unapproved Jobs',
      icon: Clock,
      badge: null,
    },
    {
      id: 'approved-jobs',
      label: 'Approved Jobs',
      icon: CheckCircle,
      badge: null,
    },
  ];

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
        {/* Main Menu Items */}
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? "default" : "ghost"}
            className={`w-full justify-start text-left ${
              currentView === item.id 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => onViewChange(item.id as any)}
          >
            <item.icon className="w-4 h-4 mr-3" />
            <span>{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}

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
              {jobManagementItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    currentView === item.id 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => handleJobManagementItemClick(item.id as any)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Admin
              </p>
              {adminItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    currentView === item.id 
                      ? "bg-red-600 text-white hover:bg-red-700" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => onViewChange(item.id as any)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Settings */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <Button
            variant={currentView === 'settings' ? "default" : "ghost"}
            className={`w-full justify-start text-left ${
              currentView === 'settings' 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => onViewChange('settings')}
          >
            <Settings className="w-4 h-4 mr-3" />
            <span>Settings</span>
          </Button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <UserProfileDropdown userProfile={userProfile} />
      </div>
    </div>
  );
}
