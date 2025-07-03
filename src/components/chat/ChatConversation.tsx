
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatGroup } from './ChatLayout';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Button } from '@/components/ui/button';
import { MoreVertical, Phone, VideoIcon } from 'lucide-react';

interface Message {
  id: string;
  group_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file';
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  job_order_id: string | null;
  created_at: string;
  read_at: string | null;
  edited_at: string | null;
  sender: {
    full_name: string;
  };
}

interface ChatConversationProps {
  group: ChatGroup;
  onShowDetails: () => void;
}

export function ChatConversation({ group, onShowDetails }: ChatConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (group.id) {
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [group.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = messagesData?.map(msg => ({
        ...msg,
        sender: {
          full_name: msg.profiles?.full_name || 'Unknown User'
        }
      })) || [];

      setMessages(formattedMessages as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`chat-messages-${group.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${group.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessages(); // Refetch to get sender info
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, messageType: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          group_id: group.id,
          sender_id: user.id,
          message_type: messageType,
          content: messageType === 'text' ? content : null,
          file_url: fileUrl || null,
          file_name: fileName || null,
          job_order_id: group.job_order_id
        });

      if (error) throw error;

      // Update group's updated_at timestamp
      await supabase
        .from('chat_groups')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', group.id);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500">
                {group.type === 'job_group' ? 'Job Group Chat' : 'Direct Message'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <VideoIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onShowDetails}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender_id === user?.id}
              showSender={
                index === 0 || 
                messages[index - 1].sender_id !== message.sender_id ||
                new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000 // 5 minutes
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
