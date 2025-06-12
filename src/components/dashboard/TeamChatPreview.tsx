
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Send, MessageSquare, Search } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  avatar?: string;
  userId: string;
}

interface TeamChatPreviewProps {
  onViewCalendar?: () => void;
}

export function TeamChatPreview({ onViewCalendar }: TeamChatPreviewProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { users, isLoading } = useUsers();

  // Simulate online users
  useEffect(() => {
    const interval = setInterval(() => {
      const randomUsers = users
        .slice(0, Math.floor(Math.random() * users.length) + 1)
        .map(user => user.id);
      setOnlineUsers(randomUsers);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [users]);

  const handleSendMessage = () => {
    if (chatMessage.trim() && selectedUser) {
      const newMessage = {
        id: Date.now().toString(),
        user: 'You',
        message: chatMessage.trim(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        avatar: 'Y',
        userId: 'current-user'
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUser(userId);
    // Load messages for this user (in real app, this would fetch from database)
    setChatMessages([
      {
        id: '1',
        user: users.find(u => u.id === userId)?.full_name || 'User',
        message: 'Hey! How are you doing?',
        time: '10:30 AM',
        avatar: getInitials(users.find(u => u.id === userId)?.full_name),
        userId: userId
      }
    ]);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  if (selectedUser) {
    const selectedUserData = users.find(u => u.id === selectedUser);
    
    return (
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedUser(null)}
              className="p-1 mr-2"
            >
              ←
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-blue-500 text-white">
                {getInitials(selectedUserData?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedUserData?.full_name || 'User'}</span>
                {isUserOnline(selectedUser) && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {isUserOnline(selectedUser) ? 'Active now' : 'Last seen recently'}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 bg-gray-50 rounded-lg p-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.userId === 'current-user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-2xl ${
                  msg.userId === 'current-user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border shadow-sm'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <div className={`text-xs mt-1 ${msg.userId === 'current-user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 rounded-full"
            />
            <Button 
              onClick={handleSendMessage} 
              className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search people..."
            value={searchUsers}
            onChange={(e) => setSearchUsers(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>

        {/* Online Indicator */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{onlineUsers.length} online</span>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading users...</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-sm bg-blue-500 text-white">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {isUserOnline(user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {user.full_name || user.email.split('@')[0]}
                    </span>
                    {isUserOnline(user.id) && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Online
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.department || user.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
