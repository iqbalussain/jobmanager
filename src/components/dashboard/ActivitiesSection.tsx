
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Zap, CheckCircle, UserPlus, Settings, Star, Rocket } from "lucide-react";

export function ActivitiesSection() {
  const recentActivities = [
    { 
      id: 1, 
      action: 'Job created', 
      details: 'Print Business Cards', 
      time: '2 mins ago', 
      type: 'create',
      icon: Zap,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    { 
      id: 2, 
      action: 'Status updated', 
      details: 'Logo Design to Working', 
      time: '5 mins ago', 
      type: 'update',
      icon: Settings,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      id: 3, 
      action: 'Job completed', 
      details: 'Banner Print Project', 
      time: '1 hour ago', 
      type: 'complete',
      icon: CheckCircle,
      color: 'from-purple-400 to-violet-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    { 
      id: 4, 
      action: 'New assignment', 
      details: 'Wedding Invitation', 
      time: '2 hours ago', 
      type: 'assign',
      icon: UserPlus,
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    { 
      id: 5, 
      action: 'Priority updated', 
      details: 'Brochure Design - High Priority', 
      time: '3 hours ago', 
      type: 'priority',
      icon: Star,
      color: 'from-yellow-400 to-amber-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    { 
      id: 6, 
      action: 'Project launched', 
      details: 'Website Redesign', 
      time: '4 hours ago', 
      type: 'launch',
      icon: Rocket,
      color: 'from-pink-400 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    },
  ];

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 h-full flex flex-col rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Activity className="w-4 h-4" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-hidden">
        {/* Activities List - Full height with scroll */}
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className={`flex items-start gap-3 p-3 ${activity.bgColor} rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${activity.color} shadow-lg`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-xs font-semibold ${activity.textColor} truncate`}>
                        {activity.action}
                      </p>
                      <Badge variant="secondary" className="text-xs bg-white/80 text-gray-600 ml-2">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 truncate mb-2">{activity.details}</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
