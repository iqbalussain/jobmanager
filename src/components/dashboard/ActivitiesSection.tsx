
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Activity, StickyNote } from "lucide-react";

interface ActivitiesSectionProps {
  stickyNote: string;
  setStickyNote: (note: string) => void;
}

export function ActivitiesSection({ stickyNote, setStickyNote }: ActivitiesSectionProps) {
  // Recent activities data
  const recentActivities = [
    { user: 'John Doe', action: 'Updated job status', time: '2 hours ago', avatar: 'JD' },
    { user: 'Jane Smith', action: 'Created new job order', time: '4 hours ago', avatar: 'JS' },
    { user: 'Mike Johnson', action: 'Completed design phase', time: '6 hours ago', avatar: 'MJ' },
    { user: 'Sarah Wilson', action: 'Added job comments', time: '8 hours ago', avatar: 'SW' }
  ];

  return (
    <div className="space-y-6">
      {/* Recent Activities */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Activity className="w-5 h-5 text-purple-600" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sticky Note */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-yellow-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <StickyNote className="w-5 h-5" />
            Personal Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write your personal notes here..."
            value={stickyNote}
            onChange={(e) => setStickyNote(e.target.value)}
            className="min-h-24 bg-yellow-50 border-yellow-200 focus:border-yellow-400 text-yellow-900 placeholder:text-yellow-600"
          />
        </CardContent>
      </Card>
    </div>
  );
}
