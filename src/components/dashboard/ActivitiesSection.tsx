
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Remove unused static icons
import { Clock, Activity, ArrowDown, ArrowLeft, ArrowUp, ArrowRight } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";

const activityIconMap: Record<string, any> = {
  created: ArrowUp,
  status_updated: ArrowRight,
  completed: ArrowDown,
  assign: ArrowLeft,
  // Add more action types if needed.
};

const colorMap: Record<string, string> = {
  created: "from-green-400 to-emerald-500",
  status_updated: "from-blue-400 to-cyan-500",
  completed: "from-purple-400 to-violet-500",
  assign: "from-orange-400 to-red-500"
};

const bgMap: Record<string, string> = {
  created: "bg-green-50",
  status_updated: "bg-blue-50",
  completed: "bg-purple-50",
  assign: "bg-orange-50"
};

const textMap: Record<string, string> = {
  created: "text-green-700",
  status_updated: "text-blue-700",
  completed: "text-purple-700",
  assign: "text-orange-700"
};

export function ActivitiesSection() {
  const { activities, isLoading } = useActivities();

  return (
    <Card className="shadow-xl border-0 glass-card h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-400 to-purple-600 text-white rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Activity className="w-4 h-4" />
          Recent Activities (Live)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading activities...</div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const IconComponent = activityIconMap[activity.action] || ArrowUp;
                const color = colorMap[activity.action] || "from-gray-300 to-gray-400";
                const bgColor = bgMap[activity.action] || "bg-gray-50";
                const textColor = textMap[activity.action] || "text-gray-600";
                return (
                  <div key={activity.id} className={`flex items-start gap-3 p-3 ${bgColor} rounded-xl border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300`}>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${color} shadow-lg`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs font-semibold ${textColor} truncate`}>
                          {activity.action.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                        </p>
                        <span className="text-xs bg-white/80 text-gray-600 ml-2 px-2 py-1 rounded">{activity.entity_type}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mb-2">{activity.description}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400">No recent activities.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
