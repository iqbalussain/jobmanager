
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatGroup } from './ChatLayout';
import { Button } from '@/components/ui/button';
import { X, Users, FileText, Image as ImageIcon, Settings } from 'lucide-react';

interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface ChatDetailsProps {
  group: ChatGroup;
  onClose: () => void;
}

export function ChatDetails({ group, onClose }: ChatDetailsProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroupMembers();
  }, [group.id]);

  const fetchGroupMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_group_members')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .eq('group_id', group.id);

      if (error) throw error;
      setMembers(data as GroupMember[] || []);
    } catch (error) {
      console.error('Error fetching group members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Chat Details</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Group Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <h4 className="font-semibold text-gray-900">{group.name}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {group.type === 'job_group' ? 'Job Group Chat' : 'Direct Message'}
          </p>
        </div>
      </div>

      {/* Members Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Members ({members.length})
            </h5>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 py-4">
              Loading members...
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {member.profiles.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.profiles.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.profiles.email}
                      </p>
                    </div>
                  </div>
                  {member.role === 'admin' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 mb-3">Quick Actions</h5>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              View Shared Files
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <ImageIcon className="w-4 h-4 mr-2" />
              View Shared Images
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Group Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
