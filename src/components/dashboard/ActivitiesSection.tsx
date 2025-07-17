
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Zap, CheckCircle, UserPlus, Settings, Star, Rocket } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";

export function ActivitiesSection() {
  const { activities, isLoading } = useActivities();

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'created': return Zap;
      case 'status_updated': return Settings;
      case 'completed': return CheckCircle;
      case 'assigned': return UserPlus;
      case 'priority_updated': return Star;
      case 'launched': return Rocket;
      default: return Activity;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'created': return {
        color: 'from-green-400 to-emerald-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700'
      };
      case 'status_updated': return {
        color: 'from-blue-400 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700'
      };
      case 'completed': return {
        color: 'from-purple-400 to-violet-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700'
      };
      case 'assigned': return {
        color: 'from-orange-400 to-red-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700'
      };
      case 'priority_updated': return {
        color: 'from-yellow-400 to-amber-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700'
      };
      default: return {
        color: 'from-gray-400 to-gray-500',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700'
      };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 h-full flex flex-col rounded-2xl">
        <CardHeader className="pb-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2 text-white text-sm">
            <Activity className="w-4 h-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center text-gray-500">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 h-full flex flex-col rounded-2xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 text-white text-base lg:text-lg">
          <Activity className="w-5 h-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-6 px-6 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center text-gray-500 py-8 flex-1 flex flex-col justify-center">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-base">No recent activities</p>
              </div>
            ) : (
              activities.map((activity) => {
                const IconComponent = getActivityIcon(activity.action);
                const colorConfig = getActivityColor(activity.action);
                
                return (
                  <div key={activity.id} className={`flex items-start gap-4 p-4 ${colorConfig.bgColor} rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]`}>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colorConfig.color} shadow-lg`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${colorConfig.textColor} truncate`}>
                          {activity.action.replace('_', ' ')}
                        </p>
                        <Badge variant="secondary" className="text-sm bg-white/80 text-gray-600 ml-3 shrink-0">
                          {activity.entity_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{formatTimeAgo(activity.created_at)}</span>
                        </div>
                        <span className="text-sm text-gray-500 truncate ml-3">{activity.user_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
