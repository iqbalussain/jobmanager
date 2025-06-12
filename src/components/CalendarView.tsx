import { useState } from "react";
import { Job } from "@/pages/Index";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isSameDay } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  Users,
  Calendar as CalendarIcon,
  ArrowLeft,
  User
} from "lucide-react";

interface CalendarViewProps {
  jobs: Job[];
}

export function CalendarView({ jobs }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showChat, setShowChat] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string, 
    user: string, 
    message: string, 
    time: string, 
    avatar: string,
    userId: string
  }>>([
    {id: '1', user: 'John Doe', message: 'Hey, can we discuss the logo design for Project Alpha?', time: '10:30 AM', avatar: 'JD', userId: 'john'},
    {id: '2', user: 'Sarah Smith', message: 'The client wants to modify the color scheme', time: '11:15 AM', avatar: 'SS', userId: 'sarah'},
    {id: '3', user: 'Mike Johnson', message: 'Working on the website layout now', time: '12:00 PM', avatar: 'MJ', userId: 'mike'},
    {id: '4', user: 'Emily Davis', message: 'Can you review the wireframes I sent?', time: '1:45 PM', avatar: 'ED', userId: 'emily'},
    {id: '5', user: 'Alex Wilson', message: 'Meeting scheduled for tomorrow at 2 PM', time: '2:30 PM', avatar: 'AW', userId: 'alex'},
  ]);

  // Get jobs for the selected date
  const jobsForDate = jobs.filter(job => {
    const jobDate = new Date(job.dueDate);
    return isSameDay(jobDate, selectedDate);
  });

  // Get dates that have jobs
  const datesWithJobs = jobs.map(job => new Date(job.dueDate));

  // Group messages by user for the chat list
  const userMessages = chatMessages.reduce((acc, msg) => {
    if (!acc[msg.userId]) {
      acc[msg.userId] = {
        user: msg.user,
        avatar: msg.avatar,
        lastMessage: msg.message,
        time: msg.time,
        messages: []
      };
    }
    acc[msg.userId].messages.push(msg);
    // Keep the latest message as the last message
    if (new Date(`2023-01-01 ${msg.time}`) > new Date(`2023-01-01 ${acc[msg.userId].time}`)) {
      acc[msg.userId].lastMessage = msg.message;
      acc[msg.userId].time = msg.time;
    }
    return acc;
  }, {} as Record<string, any>);

  const handleUserClick = (userId: string) => {
    setSelectedChatUser(userId);
    setShowChat(true);
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
    return userMessages[selectedChatUser];
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

        {/* Chat Application */}
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
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getCurrentChatUser()?.avatar}
                    </div>
                    <span>{getCurrentChatUser()?.user}</span>
                  </div>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Team Chat & Job Discussions
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {!showChat ? (
              // Chat User List
              <div className="space-y-3 h-full overflow-y-auto">
                {Object.entries(userMessages).map(([userId, userData]) => (
                  <div 
                    key={userId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => handleUserClick(userId)}
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {userData.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{userData.user}</span>
                        <span className="text-xs text-gray-500">{userData.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{userData.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Chat Messages
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  {getCurrentChatMessages().map((msg) => (
                    <div key={msg.id} className={`flex ${msg.userId === 'you' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        msg.userId === 'you' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border shadow-sm'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${msg.userId === 'you' ? 'text-blue-100' : 'text-gray-700'}`}>
                            {msg.user}
                          </span>
                          <span className={`text-xs ${msg.userId === 'you' ? 'text-blue-200' : 'text-gray-500'}`}>
                            {msg.time}
                          </span>
                        </div>
                        <p className={`text-sm ${msg.userId === 'you' ? 'text-white' : 'text-gray-900'}`}>
                          {msg.message}
                        </p>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
