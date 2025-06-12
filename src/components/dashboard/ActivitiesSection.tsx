
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";

interface ActivitiesSectionProps {
  stickyNote: string;
  setStickyNote: (note: string) => void;
}

export function ActivitiesSection({ stickyNote, setStickyNote }: ActivitiesSectionProps) {
  const { activities, isLoading: activitiesLoading } = useActivities();

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        {activitiesLoading ? (
          <div className="space-y-3 flex-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto">
            {activities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.user_name}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 flex-1 flex flex-col justify-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activities</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
