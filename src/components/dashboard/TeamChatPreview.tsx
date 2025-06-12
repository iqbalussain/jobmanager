
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  avatar?: string;
}

interface TeamChatPreviewProps {
  messages: ChatMessage[];
  onViewCalendar?: () => void;
}

export function TeamChatPreview({ messages, onViewCalendar }: TeamChatPreviewProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);

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

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
          <Users className="w-5 h-5 text-blue-600" />
          Team Chat & Job Discussions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-96">
        {/* Chat Messages with Avatars */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {chatMessages.map((msg) => (
            <div 
              key={msg.id} 
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={onViewCalendar}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">{msg.user}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <p className="text-sm text-gray-900 truncate">{msg.message}</p>
              </div>
            </div>
          ))}
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
