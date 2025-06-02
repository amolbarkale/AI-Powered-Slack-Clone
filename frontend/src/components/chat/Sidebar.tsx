
import React, { useState } from 'react';
import { Hash, Plus, MessageSquare, Settings, ChevronDown, ChevronRight, Users, MoreVertical } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../ui/button';
import ChannelCreationModal from './ChannelCreationModal';
import ChannelSettings from './ChannelSettings';

const Sidebar: React.FC = () => {
  const { channels, activeChannel, setActiveChannel, currentUser } = useChat();
  const [showChannels, setShowChannels] = useState(true);
  const [showDMs, setShowDMs] = useState(true);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [channelMenuOpen, setChannelMenuOpen] = useState<string | null>(null);
  
  const publicChannels = channels.filter(c => c.type === 'public' || c.type === 'private');
  const directMessages = channels.filter(c => c.type === 'dm' || c.type === 'group_dm');

  const handleChannelRightClick = (e: React.MouseEvent, channelId: string) => {
    e.preventDefault();
    setChannelMenuOpen(channelMenuOpen === channelId ? null : channelId);
  };

  const handleChannelSettings = (channelId: string) => {
    setActiveChannel(channelId);
    setShowChannelSettings(true);
    setChannelMenuOpen(null);
  };

  return (
    <>
      <div className="w-64 bg-gray-800 dark:bg-gray-900 text-white flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Acme Corp</h2>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <Settings size={16} />
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-1">{currentUser?.name}</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Channels Section */}
          <div className="p-4">
            <button
              onClick={() => setShowChannels(!showChannels)}
              className="flex items-center w-full text-sm font-medium text-gray-300 hover:text-white mb-2"
            >
              {showChannels ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="ml-1">Channels</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateChannel(true);
                }}
                className="ml-auto hover:bg-gray-700 rounded p-1 transition-colors"
                title="Create channel"
              >
                <Plus size={14} />
              </button>
            </button>
            
            {showChannels && (
              <div className="space-y-1">
                {publicChannels.map((channel) => (
                  <div key={channel.id} className="relative">
                    <button
                      onClick={() => setActiveChannel(channel.id)}
                      onContextMenu={(e) => handleChannelRightClick(e, channel.id)}
                      className={`flex items-center w-full px-2 py-1 text-sm rounded hover:bg-gray-700 group ${
                        activeChannel === channel.id ? 'bg-blue-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      <Hash size={16} className="mr-2" />
                      <span className="flex-1 text-left truncate">{channel.name}</span>
                      {channel.type === 'private' && (
                        <span className="text-xs">🔒</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChannelRightClick(e, channel.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-1 hover:bg-gray-600 rounded p-1 transition-all"
                      >
                        <MoreVertical size={12} />
                      </button>
                    </button>
                    
                    {/* Channel Context Menu */}
                    {channelMenuOpen === channel.id && (
                      <div className="absolute right-0 top-8 bg-gray-900 border border-gray-600 rounded-md shadow-lg z-10 py-1 min-w-32">
                        <button
                          onClick={() => handleChannelSettings(channel.id)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <Settings size={14} className="mr-2" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            // Handle view members
                            setChannelMenuOpen(null);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <Users size={14} className="mr-2" />
                          View Members
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Messages Section */}
          <div className="p-4">
            <button
              onClick={() => setShowDMs(!showDMs)}
              className="flex items-center w-full text-sm font-medium text-gray-300 hover:text-white mb-2"
            >
              {showDMs ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="ml-1">Direct Messages</span>
              <Plus size={14} className="ml-auto" />
            </button>
            
            {showDMs && (
              <div className="space-y-1">
                {directMessages.map((dm) => (
                  <button
                    key={dm.id}
                    onClick={() => setActiveChannel(dm.id)}
                    className={`flex items-center w-full px-2 py-1 text-sm rounded hover:bg-gray-700 ${
                      activeChannel === dm.id ? 'bg-blue-600 text-white' : 'text-gray-300'
                    }`}
                  >
                    <MessageSquare size={16} className="mr-2" />
                    {dm.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close channel menu */}
      {channelMenuOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setChannelMenuOpen(null)}
        />
      )}

      {/* Modals */}
      <ChannelCreationModal
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
      />
      
      <ChannelSettings
        isOpen={showChannelSettings}
        onClose={() => setShowChannelSettings(false)}
      />
    </>
  );
};

export default Sidebar;
