
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatGroup } from './ChatLayout';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatGroupsListProps {
  selectedGroup: ChatGroup | null;
  onSelectGroup: (group: ChatGroup) => void;
}

export function ChatGroupsList({ selectedGroup, onSelectGroup }: ChatGroupsListProps) {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchChatGroups();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchChatGroups = async () => {
    if (!user) return;

    try {
      const { data: groupsData, error } = await supabase
        .from('chat_groups')
        .select(`
          *,
          chat_messages!inner(
            content,
            created_at,
            sender_id,
            profiles!inner(full_name)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process groups with last message info
      const processedGroups = groupsData?.map(group => ({
        ...group,
        last_message: group.chat_messages?.[0] ? {
          content: group.chat_messages[0].content || 'File shared',
          created_at: group.chat_messages[0].created_at,
          sender_name: group.chat_messages[0].profiles?.full_name || 'Unknown'
        } : undefined
      })) || [];

      setGroups(processedGroups as ChatGroup[]);
    } catch (error) {
      console.error('Error fetching chat groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat-groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_groups'
        },
        () => {
          fetchChatGroups();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchChatGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900">Job Chats</h2>
          <Button size="sm" variant="ghost" className="p-2">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chat groups found
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedGroup?.id === group.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {group.name}
                    </h3>
                    {group.last_message && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(group.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  
                  {group.last_message && (
                    <p className="text-sm text-gray-600 truncate">
                      <span className="font-medium">{group.last_message.sender_name}:</span>{' '}
                      {group.last_message.content}
                    </p>
                  )}
                  
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      group.type === 'job_group' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <span className="text-xs text-gray-500">
                      {group.type === 'job_group' ? 'Job Group' : 'Direct Message'}
                    </span>
                  </div>
                </div>
                
                {group.unread_count && group.unread_count > 0 && (
                  <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                    {group.unread_count}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
