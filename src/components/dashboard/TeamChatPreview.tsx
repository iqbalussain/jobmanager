
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, ExternalLink } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

interface TeamChatPreviewProps {
  onGoToChat: () => void;
}

export function TeamChatPreview({ onGoToChat }: TeamChatPreviewProps) {
  const { users, isLoading } = useUsers();
  const [onlineUsers] = useState<string[]>(['user1', 'user2', 'user3']); // Simulate online users

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const recentMessages = [
    { id: 1, user: 'Ali Bashmil', message: 'The new logo design is ready for review', time: '2 mins ago', unread: true },
    { id: 2, user: 'Adnan', message: 'Print job completed successfully', time: '15 mins ago', unread: false },
    { id: 3, user: 'Abbas', message: 'Customer approved the final design', time: '1 hour ago', unread: true },
  ];

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 rounded-2xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5" />
            Team Chat Preview
          </CardTitle>
          <Button 
            onClick={onGoToChat}
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Full Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Online Users */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Online Team</span>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {onlineUsers.length} online
              </Badge>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-2 text-gray-500 text-sm">Loading...</div>
              ) : (
                users.slice(0, 4).map((user) => (
                  <div key={user.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="relative">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      {isUserOnline(user.id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {user.full_name || user.email.split('@')[0]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Recent Messages</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentMessages.map((message) => (
                <div key={message.id} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-900">{message.user}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{message.time}</span>
                      {message.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            onClick={onGoToChat}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Go to Full Messenger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
