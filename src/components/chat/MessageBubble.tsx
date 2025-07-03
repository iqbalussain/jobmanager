
import React from 'react';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file';
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  sender: {
    full_name: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSender: boolean;
}

export function MessageBubble({ message, isOwnMessage, showSender }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'text':
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            {message.file_url && (
              <img
                src={message.file_url}
                alt={message.file_name || 'Shared image'}
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => window.open(message.file_url!, '_blank')}
              />
            )}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-20 rounded-lg">
            <div className="flex-shrink-0">
              {message.file_name?.toLowerCase().includes('.pdf') ? (
                <FileText className="w-8 h-8 text-red-500" />
              ) : (
                <FileText className="w-8 h-8 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.file_name || 'Unknown file'}
              </p>
              <p className="text-xs opacity-75">
                Click to download
              </p>
            </div>
            <button
              onClick={() => window.open(message.file_url!, '_blank')}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        {showSender && !isOwnMessage && (
          <p className="text-xs text-gray-500 mb-1 px-3">
            {message.sender.full_name}
          </p>
        )}
        
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          {renderMessageContent()}
          
          <div className={`text-xs mt-1 ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}
