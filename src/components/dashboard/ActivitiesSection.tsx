import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";

export function ActivitiesSection() {
  const { activities, isLoading } = useActivities();

  return (
    <Card className="shadow-xl border-0 bg-white/20 dark:bg-black/30 backdrop-blur-lg h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-600/70 to-purple-700/70 text-white">
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Activity className="w-4 h-4" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200">
          <div className="space-y-3">
            {isLoading && (
              <div className="text-center text-base text-gray-500 py-8">Loading...</div>
            )}
            {!isLoading && activities.length === 0 && (
              <div className="text-center text-base text-gray-500 py-8">No recent activities</div>
            )}
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 bg-gradient-to-r from-[#232946]/60 to-[#43217d]/50 dark:from-[#161b22]/60 dark:to-[#28253a]/50 rounded-xl border border-white/10 hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 via-blue-800 to-purple-700 shadow-lg">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-100 truncate">{activity.action}</p>
                    <Badge variant="secondary" className="text-xs bg-white/60 text-gray-600 ml-2">
                      {activity.entity_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-300 truncate mb-2">{activity.description}</p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleString()}</span>
                    <span className="ml-2 text-xs text-blue-300">{activity.user_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
