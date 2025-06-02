
import React, { useState } from 'react';
import { X, Hash, Lock, Users, Archive } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../ui/button';
import MemberManagement from './MemberManagement';

interface ChannelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChannelSettings: React.FC<ChannelSettingsProps> = ({ isOpen, onClose }) => {
  const { channels, activeChannel, updateChannel, archiveChannel } = useChat();
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'permissions'>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');

  const channel = channels.find(c => c.id === activeChannel);
  
  React.useEffect(() => {
    if (channel) {
      setChannelName(channel.name);
      setDescription(channel.description || '');
      setTopic(channel.topic || '');
    }
  }, [channel]);

  if (!isOpen || !channel) return null;

  const handleSaveChanges = async () => {
    await updateChannel(channel.id, {
      name: channelName,
      description,
      topic
    });
    setIsEditing(false);
  };

  const handleArchiveChannel = async () => {
    if (!confirm('Are you sure you want to archive this channel?')) return;
    
    await archiveChannel(channel.id);
    onClose();
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Hash },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Lock }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {channel.type === 'private' ? <Lock size={20} /> : <Hash size={20} />}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {channel.name}
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X size={16} />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Channel Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Channel Information</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Channel name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{channel.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {channel.description || 'No description set'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Topic
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Set a topic for this channel"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {channel.topic || 'No topic set'}
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Channel Stats */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Channel Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {channel.members.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Members</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {channel.type === 'private' ? 'Private' : 'Public'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Channel Type</div>
                  </div>
                </div>
              </div>

              {/* Archive Channel */}
              <div className="border-t border-red-200 dark:border-red-800 pt-6">
                <h4 className="font-medium text-red-900 dark:text-red-400 mb-3">Archive Channel</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleArchiveChannel}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                  >
                    <Archive size={14} className="mr-1" />
                    Archive Channel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <MemberManagement channelId={channel.id} />
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Channel Permissions</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Post Messages</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Allow members to post messages</div>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">All Members</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Upload Files</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Allow file uploads</div>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">All Members</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Manage Channel</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Edit channel settings</div>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">All Members</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelSettings;
