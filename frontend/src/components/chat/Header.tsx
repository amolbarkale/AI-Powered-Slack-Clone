
import React, { useState } from 'react';
import { Search, Settings, Hash, Brain, Users, Info } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../ui/button';
import ChannelSettings from './ChannelSettings';

const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, activeChannel, channels, getChannelMembers } = useChat();
  const [showOrgBrain, setShowOrgBrain] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  
  const activeChannelData = channels.find(c => c.id === activeChannel);
  const channelMembers = getChannelMembers(activeChannel);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          {/* Channel Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {activeChannelData?.type === 'public' || activeChannelData?.type === 'private' ? (
                <Hash size={20} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {activeChannelData?.name}
                </h1>
                {activeChannelData?.topic && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activeChannelData.topic}
                  </p>
                )}
              </div>
            </div>
            
            {/* Channel Info Button */}
            {(activeChannelData?.type === 'public' || activeChannelData?.type === 'private') && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChannelSettings(true)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Users size={16} className="mr-1" />
                  {channelMembers.length}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChannelSettings(true)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Channel settings"
                >
                  <Info size={16} />
                </Button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOrgBrain(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0 hover:from-purple-600 hover:to-blue-700 transition-all"
            >
              <Brain size={16} className="mr-2" />
              🧠 Ask Org Brain
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Org Brain Modal */}
      {showOrgBrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🧠 Ask Org Brain</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your AI assistant that knows everything about your workspace. Ask questions about projects, people, or processes!
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                💬 "What did the team decide about the new feature?"<br/>
                📊 "Show me Sarah's latest designs"<br/>
                🎯 "What are this week's priorities?"
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowOrgBrain(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Channel Settings Modal */}
      <ChannelSettings
        isOpen={showChannelSettings}
        onClose={() => setShowChannelSettings(false)}
      />
    </>
  );
};

export default Header;
