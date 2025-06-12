
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Save, Trash2 } from "lucide-react";

interface ActivitiesSectionProps {
  stickyNote: string;
  setStickyNote: (note: string) => void;
}

export function ActivitiesSection({ stickyNote, setStickyNote }: ActivitiesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const recentActivities = [
    { id: 1, action: 'Job created', details: 'Print Business Cards', time: '2 mins ago', type: 'create' },
    { id: 2, action: 'Status updated', details: 'Logo Design to Working', time: '5 mins ago', type: 'update' },
    { id: 3, action: 'Job completed', details: 'Banner Print Project', time: '1 hour ago', type: 'complete' },
    { id: 4, action: 'New assignment', details: 'Wedding Invitation', time: '2 hours ago', type: 'assign' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return '✨';
      case 'update': return '🔄';
      case 'complete': return '✅';
      case 'assign': return '👤';
      default: return '📝';
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 h-full flex flex-col rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Activity className="w-4 h-4" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col overflow-hidden">
        {/* Sticky Notes Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700">Quick Notes</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="h-6 px-2 text-xs"
            >
              {isEditing ? <Save className="w-3 h-3" /> : '✏️'}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={stickyNote}
              onChange={(e) => setStickyNote(e.target.value)}
              placeholder="Add your notes..."
              className="min-h-[60px] text-xs border-2 border-yellow-200 bg-yellow-50 rounded-lg"
            />
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 min-h-[60px]">
              <p className="text-xs text-gray-700">
                {stickyNote || "Click edit to add notes..."}
              </p>
            </div>
          )}
        </div>

        {/* Activities List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200">
                <div className="text-sm mt-0.5">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-600 truncate">{activity.details}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
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
