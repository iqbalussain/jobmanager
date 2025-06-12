
import { useState } from "react";
import { Job } from "@/pages/Index";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, isSameDay } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  Users,
  Calendar as CalendarIcon,
  ArrowLeft,
  Search
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
  const [onlineUsers] = useState<string[]>(['user1', 'user2', 'user3']); // Simulate online users
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string, 
    user: string, 
    message: string, 
    time: string, 
    avatar: string,
    userId: string
  }>>([]);

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
        userId: userId
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
        userId: 'you'
      };
      
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
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

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar & Chat</h1>
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
                <div className="space-y-2">
                  {jobsForDate.slice(0, 3).map((job) => (
                    <div key={job.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium truncate">{job.title}</div>
                      <div className="text-gray-600 text-xs">{job.customer}</div>
                    </div>
                  ))}
                  {jobsForDate.length > 3 && (
                    <p className="text-xs text-gray-500">+{jobsForDate.length - 3} more jobs</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Chat Application */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
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
                      {isUserOnline(selectedChatUser) ? 'Active now' : 'Last seen recently'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Team Messenger
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {!showChat ? (
              // User List with Search and Online Status
              <div className="h-full flex flex-col">
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

                {/* Online Counter */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{onlineUsers.length} online</span>
                  </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {usersLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading users...</div>
                  ) : (
                    filteredUsers.map((user) => (
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
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 truncate">{user.full_name || user.email.split('@')[0]}</span>
                            {isUserOnline(user.id) && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                Online
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{user.department || user.role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  {getCurrentChatMessages().map((msg) => (
                    <div key={msg.id} className={`flex ${msg.userId === 'you' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                        msg.userId === 'you' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border shadow-sm'
                      }`}>
                        <p className={`text-sm ${msg.userId === 'you' ? 'text-white' : 'text-gray-900'}`}>
                          {msg.message}
                        </p>
                        <div className={`text-xs mt-1 ${msg.userId === 'you' ? 'text-blue-200' : 'text-gray-500'}`}>
                          {msg.time}
                        </div>
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
                    className="flex-1 rounded-full"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
