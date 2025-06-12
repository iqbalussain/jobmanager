
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Send } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  avatar?: string;
}

interface TeamChatPreviewProps {
  onViewCalendar?: () => void;
}

export function TeamChatPreview({ onViewCalendar }: TeamChatPreviewProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const { users, isLoading } = useUsers();

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        user: 'You',
        message: chatMessage.trim(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        avatar: 'Y'
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
          <Users className="w-5 h-5 text-blue-600" />
          Team Members & Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-96">
        {/* Team Members List */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Team Members</h4>
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading team members...</div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {users.slice(0, 6).map((user) => (
                <div key={user.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-blue-500 text-white">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-700 truncate max-w-20">
                    {user.full_name || user.email.split('@')[0]}
                  </span>
                </div>
              ))}
              {users.length > 6 && (
                <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full">
                  <span className="text-xs text-gray-600">+{users.length - 6}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={onViewCalendar}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-500 text-white text-sm font-bold">
                    {msg.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">{msg.user}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-900">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Chat Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
