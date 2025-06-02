
import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

const ChatArea: React.FC = () => {
  const { getChannelMessages, activeChannel, channels } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = getChannelMessages(activeChannel);
  const activeChannelData = channels?.find(c => c.id === activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Channel Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-3">
            {activeChannelData?.type === 'public' || activeChannelData?.type === 'private' ? (
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">#</span>
              </div>
            ) : (
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl font-bold">@</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeChannelData?.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeChannelData?.type === 'public' || activeChannelData?.type === 'private' 
                  ? 'Team collaboration space' 
                  : 'Direct message conversation'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="pb-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  Welcome to {activeChannelData?.type === 'public' || activeChannelData?.type === 'private' ? '#' : '@'}{activeChannelData?.name}!
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Start the conversation by sending a message.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                showThreadButton={true}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Composer */}
      <MessageComposer />
    </div>
  );
};

export default ChatArea;
