
import React, { useState } from 'react';
import { Plus, UserMinus, Crown, Shield, User } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../ui/button';

interface MemberManagementProps {
  channelId: string;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ channelId }) => {
  const { channels, getChannelMembers, currentUser } = useChat();
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const channel = channels.find(c => c.id === channelId);
  const members = getChannelMembers(channelId);

  // Mock available users to add (in real app, this would come from workspace members)
  const availableUsers = [
    { id: 'user_5', name: 'Alex Smith', email: 'alex@company.com', role: 'member' as const },
    { id: 'user_6', name: 'Maria Garcia', email: 'maria@company.com', role: 'member' as const },
    { id: 'user_7', name: 'David Wilson', email: 'david@company.com', role: 'member' as const }
  ].filter(user => !channel?.members.includes(user.id));

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = (userId: string) => {
    console.log(`Adding user ${userId} to channel ${channelId}`);
    setShowAddMember(false);
    setSearchQuery('');
  };

  const handleRemoveMember = (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    console.log(`Removing user ${userId} from channel ${channelId}`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} className="text-yellow-500" />;
      case 'moderator':
        return <Shield size={16} className="text-blue-500" />;
      default:
        return <User size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Channel Members</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowAddMember(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} className="mr-1" />
          Add Member
        </Button>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-900 dark:text-white">Add Members</h5>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddMember(false);
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
          </div>
          
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3"
          />

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredAvailableUsers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm py-2">
                {searchQuery ? 'No users found' : 'No available users to add'}
              </p>
            ) : (
              filteredAvailableUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddMember(user.id)}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <div className="flex items-center space-x-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </span>
                  {getRoleIcon(member.role)}
                  {member.id === currentUser?.id && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">(You)</span>
                  )}
                  {channel?.createdBy === member.id && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Owner
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {member.email}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {member.role}
              </div>
              {member.id !== currentUser?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <UserMinus size={16} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberManagement;
