
import React, { useState } from 'react';
import { X, Hash, Lock, Users } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../ui/button';

interface ChannelCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChannelCreationModal: React.FC<ChannelCreationModalProps> = ({ isOpen, onClose }) => {
  const { createChannel, currentUser } = useChat();
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [channelType, setChannelType] = useState<'public' | 'private'>('public');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    setIsLoading(true);
    try {
      await createChannel({
        name: channelName.toLowerCase().replace(/\s+/g, '-'),
        description,
        type: channelType,
        members: currentUser ? [currentUser.id] : []
      });
      
      setChannelName('');
      setDescription('');
      setChannelType('public');
      onClose();
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create a channel</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Channel Type</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setChannelType('public')}
                className={`flex-1 p-3 rounded-md border-2 transition-colors ${
                  channelType === 'public'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Hash size={20} className="text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Public</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Anyone can join</div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setChannelType('private')}
                className={`flex-1 p-3 rounded-md border-2 transition-colors ${
                  channelType === 'private'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Lock size={20} className="text-gray-600 dark:text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Private</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Invite only</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Channel Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Channel name
            </label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. marketing"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lowercase, no spaces. Use dashes or underscores instead.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!channelName.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create Channel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelCreationModal;
