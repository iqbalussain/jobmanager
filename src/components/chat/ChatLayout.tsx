
import React, { useState } from 'react';
import { ChatGroupsList } from './ChatGroupsList';
import { ChatConversation } from './ChatConversation';
import { ChatDetails } from './ChatDetails';
import { useAuth } from '@/hooks/useAuth';

export interface ChatGroup {
  id: string;
  name: string;
  job_order_id: string | null;
  type: 'job_group' | 'direct';
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_name: string;
  };
  unread_count?: number;
}

export function ChatLayout() {
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Please log in to access chat.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Chat Groups List */}
      <div className="w-1/3 min-w-80 bg-white border-r border-gray-200">
        <ChatGroupsList 
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />
      </div>

      {/* Center Panel - Chat Conversation */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <ChatConversation 
            group={selectedGroup}
            onShowDetails={() => setShowDetails(!showDetails)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Chat</h3>
              <p className="text-gray-500">Select a job group to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Chat Details (Collapsible) */}
      {selectedGroup && showDetails && (
        <div className="w-80 bg-white border-l border-gray-200">
          <ChatDetails 
            group={selectedGroup}
            onClose={() => setShowDetails(false)}
          />
        </div>
      )}
    </div>
  );
}
