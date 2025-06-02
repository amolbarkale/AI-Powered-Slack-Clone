
import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, Users, Pin } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../ui/button';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

const ThreadPanel: React.FC = () => {
  const { 
    activeThread, 
    setActiveThread, 
    toggleThreadPanel, 
    getThreadMessages, 
    isThreadPanelOpen,
    getChannelMembers,
    activeChannel
  } = useChat();
  const [showNotesGenerator, setShowNotesGenerator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threadMessages = getThreadMessages(activeThread || '');
  const parentMessage = threadMessages[0];
  const replies = threadMessages.slice(1);
  const channelMembers = getChannelMembers(activeChannel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  if (!isThreadPanelOpen || !activeThread) return null;

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Thread Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Thread</h3>
          <div className="flex items-center space-x-2">
            {/* Generate Notes Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotesGenerator(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              <FileText size={14} className="mr-1" />
              📝 Notes
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveThread(null);
                toggleThreadPanel(false);
              }}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Thread Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>{replies.length + 1} {replies.length === 0 ? 'reply' : 'replies'}</span>
          </div>
          {parentMessage && (
            <div className="flex items-center space-x-1">
              <Pin size={14} />
              <span>Started by {parentMessage.user.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto">
        {/* Parent Message */}
        {parentMessage && (
          <div className="border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <MessageBubble 
              message={parentMessage} 
              showThreadButton={false}
            />
          </div>
        )}

        {/* Thread Replies */}
        <div className="pb-4">
          {replies.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  No replies yet
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            replies.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                showThreadButton={false}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Thread Message Composer */}
      <MessageComposer 
        threadId={activeThread}
        placeholder="Reply to thread..."
      />

      {/* Notes Generator Modal */}
      {showNotesGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📝 AI Meeting Notes</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              AI will analyze this thread conversation and generate structured meeting notes, action items, and key decisions.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preview Notes:</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <div className="font-medium">📋 Summary:</div>
                <p>Discussion about {parentMessage?.content.slice(0, 50)}...</p>
                
                <div className="font-medium mt-2">✅ Action Items:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Follow up on discussed points</li>
                  <li>Schedule next meeting if needed</li>
                  <li>Share findings with team</li>
                </ul>
                
                <div className="font-medium mt-2">🎯 Key Decisions:</div>
                <ul className="list-disc list-inside">
                  <li>Proceed with current approach</li>
                </ul>
                
                <div className="font-medium mt-2">👥 Participants:</div>
                <p>{channelMembers.slice(0, 3).map(m => m.name).join(', ')}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowNotesGenerator(false)}>
                Close Preview
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600">
                Generate Full Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadPanel;
