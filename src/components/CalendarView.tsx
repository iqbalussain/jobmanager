import { useState } from "react";
import { Job } from "@/types/job";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  Users,
  Calendar as CalendarIcon,
  ArrowLeft,
  Search,
  Plus,
  Settings,
  Image,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

interface CalendarViewProps {
  jobs: Job[];
}

export function CalendarView({ jobs }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showChat, setShowChat] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [onlineUsers] = useState<string[]>(['user1', 'user2', 'user3']);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string, 
    user: string, 
    message: string, 
    time: string, 
    avatar: string,
    userId: string,
    status: 'sent' | 'delivered' | 'seen',
    type: 'text' | 'image' | 'file'
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  const { users, isLoading: usersLoading } = useUsers();

  // Get jobs for the selected date
  const jobsForDate = jobs.filter(job => {
    const jobDate = new Date(job.dueDate);
    return isSameDay(jobDate, selectedDate);
  });

  // Get dates that have jobs
  const datesWithJobs = jobs.map(job => new Date(job.dueDate));

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const handleUserClick = (userId: string) => {
    setSelectedChatUser(userId);
    setShowChat(true);
    // Load messages for this user
    setChatMessages([
      {
        id: '1',
        user: users.find(u => u.id === userId)?.full_name || 'User',
        message: 'Hey! Ready for today\'s meetings?',
        time: '10:30 AM',
        avatar: getInitials(users.find(u => u.id === userId)?.full_name),
        userId: userId,
        status: 'seen',
        type: 'text'
      }
    ]);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && selectedChatUser) {
      const newMessage = {
        id: Date.now().toString(),
        user: 'You',
        message: chatMessage.trim(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        avatar: 'Y',
        userId: 'you',
        status: 'sent' as const,
        type: 'text' as const
      };
      
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
      
      // Simulate message status updates
      setTimeout(() => {
        setChatMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? {...msg, status: 'delivered'} : msg
        ));
      }, 1000);
      
      setTimeout(() => {
        setChatMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? {...msg, status: 'seen'} : msg
        ));
      }, 2000);
    }
  };

  const getCurrentChatMessages = () => {
    if (!selectedChatUser) return [];
    return chatMessages.filter(msg => msg.userId === selectedChatUser || msg.userId === 'you');
  };

  const getCurrentChatUser = () => {
    if (!selectedChatUser) return null;
    return users.find(u => u.id === selectedChatUser);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'seen': return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar & Job Messenger</h1>
        <p className="text-gray-600">View job schedules and communicate with your team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Job Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                hasJobs: datesWithJobs
              }}
              modifiersStyles={{
                hasJobs: { backgroundColor: '#dbeafe', fontWeight: 'bold' }
              }}
              className="rounded-md border"
            />
            
            {/* Show jobs for selected date */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Jobs for {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              {jobsForDate.length === 0 ? (
                <p className="text-gray-500 text-sm">No jobs scheduled for this date</p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {jobsForDate.map((job) => (
                    <div key={job.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium truncate">{job.title}</div>
                      <div className="text-gray-600 text-xs">{job.customer}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Job Messenger */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              {showChat && selectedChatUser ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowChat(false)}
                    className="p-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-blue-500 text-white">
                      {getInitials(getCurrentChatUser()?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getCurrentChatUser()?.full_name}</span>
                      {isUserOnline(selectedChatUser) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isUserOnline(selectedChatUser) ? 'Online' : 'Last seen recently'}
                      {isTyping && <span className="ml-2 text-blue-500">typing...</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Job Messenger
                  <div className="flex gap-2 ml-auto">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-96 p-0">
            {!showChat ? (
              // User List with enhanced features
              <div className="h-full flex flex-col">
                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchUsers}
                      onChange={(e) => setSearchUsers(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Online Status */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{onlineUsers.length} contacts online</span>
                  </div>
                </div>

                {/* Users List */}
                <ScrollArea className="flex-1">
                  <div className="space-y-1">
                    {usersLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading conversations...</div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div 
                          key={user.id}
                          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="text-sm bg-blue-500 text-white">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            {isUserOnline(user.id) && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 truncate">{user.full_name || user.email.split('@')[0]}</span>
                              <span className="text-xs text-gray-500">2:30 PM</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">Click to start conversation...</p>
                          </div>
                          {Math.random() > 0.5 && (
                            <Badge variant="default" className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                              {Math.floor(Math.random() * 5) + 1}
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              // Enhanced Chat Messages
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 p-4 bg-gray-50">
                  <div className="space-y-3">
                    {getCurrentChatMessages().map((msg) => (
                      <div key={msg.id} className={`flex ${msg.userId === 'you' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md relative ${
                          msg.userId === 'you' 
                            ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md' 
                            : 'bg-white border shadow-sm rounded-r-2xl rounded-tl-2xl rounded-bl-md'
                        } px-4 py-2`}>
                          <p className={`text-sm ${msg.userId === 'you' ? 'text-white' : 'text-gray-900'}`}>
                            {msg.message}
                          </p>
                          <div className={`flex items-center gap-1 text-xs mt-1 ${
                            msg.userId === 'you' ? 'text-blue-200 justify-end' : 'text-gray-500'
                          }`}>
                            <span>{msg.time}</span>
                            {msg.userId === 'you' && getStatusIcon(msg.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Enhanced Chat Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 rounded-full border-gray-300"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!chatMessage.trim()}
                      className="bg-blue-500 hover:bg-blue-600 rounded-full w-10 h-10 p-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
