
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";

export function ActivitiesSection() {
  const { activities, isLoading } = useActivities();

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-pink-50 to-blue-50 h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="pb-3 bg-gradient-to-r from-rose-400/70 to-blue-400/70 text-white">
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <ArrowRight className="w-4 h-4 text-pink-200" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-3">
            {isLoading && (
              <div className="text-center text-base text-gray-500 py-8">Loading...</div>
            )}
            {!isLoading && activities.length === 0 && (
              <div className="text-center text-base text-gray-500 py-8">No recent activities</div>
            )}
            {activities.map((activity, i) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 bg-gradient-to-r from-[#f9e6ff]/60 to-[#f8fafc]/50 rounded-xl border border-white/10 hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-pink-200 via-blue-100 to-pink-100 shadow-lg">
                  {i % 2 === 0 ? (
                    <ArrowLeft className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-pink-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">{activity.action}</p>
                    <Badge variant="secondary" className="text-xs bg-white/60 text-gray-600 ml-2">
                      {activity.entity_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 truncate mb-2">{activity.description}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-blue-400">{new Date(activity.created_at).toLocaleString()}</span>
                    <span className="ml-2 text-xs text-pink-700">{activity.user_name}</span>
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
