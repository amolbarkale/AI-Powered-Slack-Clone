import React, { createContext, useContext, useState, useEffect } from 'react';

// Enhanced user interface
export const User = {
  id: String,
  name: String,
  email: String,
  avatar: String,
  status: String, // 'available' | 'away' | 'dnd' | 'custom'
  statusText: String,
  timezone: String,
  role: String, // 'admin' | 'member' | 'guest'
  lastSeen: String,
  bio: String,
  phone: String,
};

// Enhanced message interface
export const Message = {
  id: String,
  user: Object, // User
  content: String,
  timestamp: String,
  channel: String,
  threadId: String,
  mentions: Array, // string[]
  reactions: Array, // Reaction[]
  files: Array, // FileAttachment[]
  edited: Boolean,
  editedAt: String,
  type: String, // 'message' | 'system' | 'file_share'
  scheduled: Boolean,
  scheduledFor: String,
};

export const Reaction = {
  emoji: String,
  users: Array, // string[]
  count: Number,
};

export const FileAttachment = {
  id: String,
  name: String,
  url: String,
  size: Number,
  type: String,
  uploadedBy: String,
  uploadedAt: String,
};

// Enhanced channel interface
export const Channel = {
  id: String,
  name: String,
  description: String,
  type: String, // 'public' | 'private' | 'dm' | 'group_dm'
  members: Array, // string[]
  createdBy: String,
  createdAt: String,
  pinnedMessages: Array, // string[]
  topic: String,
  isArchived: Boolean,
  notificationLevel: String, // 'all' | 'mentions' | 'nothing'
};

export const Workspace = {
  id: String,
  name: String,
  icon: String,
  members: Array, // User[]
  channels: Array, // Channel[]
  createdAt: String,
  settings: Object, // WorkspaceSettings
};

export const WorkspaceSettings = {
  defaultChannels: Array, // string[]
  messageRetention: Number,
  allowGuestAccess: Boolean,
  requireApprovalForChannels: Boolean,
};

export const NotificationSettings = {
  desktop: Boolean,
  sound: Boolean,
  workHours: Object, // { start: string; end: string }
  dndSchedule: Object, // { start: string; end: string }
  channelOverrides: Object, // Record<string, 'all' | 'mentions' | 'nothing'>
};

const ChatContext = createContext();

// Mock data
const mockUsers = [
  {
    id: 'user_1',
    name: 'John Doe',
    email: 'john@company.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    status: 'available',
    statusText: '',
    timezone: 'PST',
    role: 'admin',
    lastSeen: new Date().toISOString(),
    bio: 'Product Manager at Company Inc.',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 'user_2',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b95c2c7d?w=40&h=40&fit=crop&crop=face',
    status: 'available',
    timezone: 'EST',
    role: 'member',
    lastSeen: new Date().toISOString(),
    bio: 'Lead Designer'
  },
  {
    id: 'user_3',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    status: 'away',
    statusText: 'In meetings until 3pm',
    timezone: 'CST',
    role: 'member',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    bio: 'Senior Developer'
  },
  {
    id: 'user_4',
    name: 'Emily Davis',
    email: 'emily@company.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    status: 'available',
    timezone: 'PST',
    role: 'member',
    lastSeen: new Date().toISOString(),
    bio: 'Marketing Manager'
  }
];

const mockChannels = [
  {
    id: 'channel_1',
    name: 'general',
    description: 'Company-wide announcements and work-based matters',
    type: 'public',
    members: ['user_1', 'user_2', 'user_3', 'user_4'],
    createdBy: 'user_1',
    createdAt: '2023-01-01T00:00:00Z',
    pinnedMessages: [],
    topic: 'General discussion for everyone',
    isArchived: false,
    notificationLevel: 'all'
  },
  {
    id: 'channel_2',
    name: 'random',
    description: 'Non-work banter and water cooler conversation',
    type: 'public',
    members: ['user_1', 'user_2', 'user_3', 'user_4'],
    createdBy: 'user_2',
    createdAt: '2023-01-02T00:00:00Z',
    pinnedMessages: [],
    topic: 'Random discussions, memes, and fun',
    isArchived: false,
    notificationLevel: 'mentions'
  },
  {
    id: 'channel_3',
    name: 'marketing',
    description: 'Marketing team discussions',
    type: 'private',
    members: ['user_1', 'user_4'],
    createdBy: 'user_4',
    createdAt: '2023-01-03T00:00:00Z',
    pinnedMessages: [],
    topic: 'Marketing campaigns and strategies',
    isArchived: false,
    notificationLevel: 'all'
  },
  {
    id: 'dm_1',
    name: '',
    description: '',
    type: 'dm',
    members: ['user_1', 'user_2'],
    createdBy: 'user_1',
    createdAt: '2023-01-04T00:00:00Z',
    pinnedMessages: [],
    isArchived: false,
    notificationLevel: 'all'
  }
];

const generateMockMessages = () => [
  {
    id: 'msg_1',
    user: mockUsers[0],
    content: 'Good morning everyone! Hope you all had a great weekend.',
    timestamp: '2023-04-10T09:00:00Z',
    channel: 'channel_1',
    mentions: [],
    reactions: [
      { emoji: '👍', users: ['user_2', 'user_3'], count: 2 },
      { emoji: '☕', users: ['user_4'], count: 1 }
    ],
    files: [],
    edited: false,
    type: 'message'
  },
  {
    id: 'msg_2',
    user: mockUsers[1],
    content: 'Morning John! Weekend was great. Ready for our meeting at 11?',
    timestamp: '2023-04-10T09:05:00Z',
    channel: 'channel_1',
    mentions: ['user_1'],
    reactions: [],
    files: [],
    edited: false,
    type: 'message'
  },
  {
    id: 'msg_3',
    user: mockUsers[2],
    content: 'I\'ve finished the report we discussed on Friday. Attaching it here.',
    timestamp: '2023-04-10T09:10:00Z',
    channel: 'channel_1',
    mentions: [],
    reactions: [{ emoji: '🎉', users: ['user_1'], count: 1 }],
    files: [
      {
        id: 'file_1',
        name: 'Q1_Report.pdf',
        url: '#',
        size: 2500000,
        type: 'application/pdf',
        uploadedBy: 'user_3',
        uploadedAt: '2023-04-10T09:10:00Z'
      }
    ],
    edited: false,
    type: 'file_share'
  },
  {
    id: 'msg_4',
    user: mockUsers[0],
    content: 'Thanks Mike! I\'ll review it before the meeting.',
    timestamp: '2023-04-10T09:15:00Z',
    channel: 'channel_1',
    threadId: 'msg_3',
    mentions: ['user_3'],
    reactions: [],
    files: [],
    edited: false,
    type: 'message'
  },
  {
    id: 'msg_5',
    user: mockUsers[3],
    content: 'Just a reminder that we need to finalize the marketing campaign by EOD.',
    timestamp: '2023-04-10T10:00:00Z',
    channel: 'channel_3',
    mentions: [],
    reactions: [],
    files: [],
    edited: false,
    type: 'message'
  },
  {
    id: 'msg_6',
    user: mockUsers[0],
    content: 'I\'ll have my feedback ready by 3 PM.',
    timestamp: '2023-04-10T10:05:00Z',
    channel: 'channel_3',
    mentions: [],
    reactions: [{ emoji: '👍', users: ['user_4'], count: 1 }],
    files: [],
    edited: false,
    type: 'message'
  },
  {
    id: 'msg_7',
    user: mockUsers[0],
    content: 'Hey Sarah, can you send me the design files when you get a chance?',
    timestamp: '2023-04-10T11:00:00Z',
    channel: 'dm_1',
    mentions: [],
    reactions: [],
    files: [],
    edited: false,
    type: 'message'
  },
  {
    id: 'msg_8',
    user: mockUsers[1],
    content: 'Sure thing! Here they are.',
    timestamp: '2023-04-10T11:10:00Z',
    channel: 'dm_1',
    mentions: [],
    reactions: [{ emoji: '🙏', users: ['user_1'], count: 1 }],
    files: [
      {
        id: 'file_2',
        name: 'Homepage_Redesign.fig',
        url: '#',
        size: 15000000,
        type: 'application/figma',
        uploadedBy: 'user_2',
        uploadedAt: '2023-04-10T11:10:00Z'
      }
    ],
    edited: false,
    type: 'file_share'
  }
];

const mockDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const ChatProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo purposes
  const [currentUser, setCurrentUser] = useState(mockUsers[0]);
  const [workspaces, setWorkspaces] = useState([
    {
      id: 'workspace_1',
      name: 'Company Inc.',
      icon: null,
      members: mockUsers,
      channels: mockChannels,
      createdAt: '2023-01-01T00:00:00Z',
      settings: {
        defaultChannels: ['channel_1'],
        messageRetention: 365,
        allowGuestAccess: true,
        requireApprovalForChannels: false
      }
    }
  ]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [channels, setChannels] = useState(mockChannels);
  const [activeChannel, setActiveChannel] = useState('channel_1');
  const [messages, setMessages] = useState(generateMockMessages());
  const [activeThread, setActiveThread] = useState(null);
  const [isThreadPanelOpen, setIsThreadPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    desktop: true,
    sound: true,
    workHours: { start: '09:00', end: '17:00' },
    channelOverrides: {}
  });
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);

  useEffect(() => {
    // Set the current workspace when component mounts
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace]);

  const login = async (email, password) => {
    await mockDelay();
    // In a real app, this would make an API call to authenticate
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const signup = async (userData) => {
    await mockDelay();
    // In a real app, this would make an API call to register a new user
    const newUser = {
      id: `user_${mockUsers.length + 1}`,
      name: userData.name,
      email: userData.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`,
      status: 'available',
      timezone: 'UTC',
      role: 'member',
      lastSeen: new Date().toISOString(),
      ...userData
    };
    
    // Add the new user
    mockUsers.push(newUser);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates) => {
    await mockDelay();
    setCurrentUser(prev => ({ ...prev, ...updates }));
    return true;
  };

  const createChannel = async (channelData) => {
    await mockDelay();
    const newChannel = {
      id: `channel_${channels.length + 1}`,
      name: channelData.name,
      description: channelData.description || '',
      type: channelData.type || 'public',
      members: [currentUser.id, ...(channelData.members || [])],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      pinnedMessages: [],
      topic: channelData.topic || '',
      isArchived: false,
      notificationLevel: 'all',
      ...channelData
    };
    
    setChannels(prev => [...prev, newChannel]);
    return newChannel.id;
  };

  const updateChannel = async (channelId, updates) => {
    await mockDelay();
    setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, ...updates } : ch));
    return true;
  };

  const joinChannel = async (channelId) => {
    await mockDelay();
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId && !ch.members.includes(currentUser.id)) {
        return { ...ch, members: [...ch.members, currentUser.id] };
      }
      return ch;
    }));
    return true;
  };

  const leaveChannel = async (channelId) => {
    await mockDelay();
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId && ch.members.includes(currentUser.id)) {
        return { ...ch, members: ch.members.filter(id => id !== currentUser.id) };
      }
      return ch;
    }));
    return true;
  };

  const archiveChannel = async (channelId) => {
    await mockDelay();
    setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, isArchived: true } : ch));
    return true;
  };

  const sendMessage = async (content, threadId, files = []) => {
    await mockDelay();
    const newMessage = {
      id: `msg_${messages.length + 1}`,
      user: currentUser,
      content,
      timestamp: new Date().toISOString(),
      channel: activeChannel,
      threadId,
      mentions: [], // Would parse content for @mentions in a real app
      reactions: [],
      files,
      edited: false,
      type: files.length > 0 ? 'file_share' : 'message'
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const editMessage = async (messageId, newContent) => {
    await mockDelay();
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, content: newContent, edited: true, editedAt: new Date().toISOString() };
      }
      return msg;
    }));
    return true;
  };

  const deleteMessage = async (messageId) => {
    await mockDelay();
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    return true;
  };

  const addReaction = async (messageId, emoji) => {
    await mockDelay();
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          // Add user to existing reaction if not already there
          if (!existingReaction.users.includes(currentUser.id)) {
            return {
              ...msg,
              reactions: msg.reactions.map(r => r.emoji === emoji 
                ? { ...r, users: [...r.users, currentUser.id], count: r.count + 1 }
                : r
              )
            };
          }
          return msg;
        } else {
          // Create new reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, users: [currentUser.id], count: 1 }]
          };
        }
      }
      return msg;
    }));
    return true;
  };

  const removeReaction = async (messageId, emoji) => {
    await mockDelay();
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction && existingReaction.users.includes(currentUser.id)) {
          // Remove user from reaction
          const updatedUsers = existingReaction.users.filter(id => id !== currentUser.id);
          if (updatedUsers.length === 0) {
            // Remove the reaction entirely if no users left
            return {
              ...msg,
              reactions: msg.reactions.filter(r => r.emoji !== emoji)
            };
          } else {
            // Update the reaction with the user removed
            return {
              ...msg,
              reactions: msg.reactions.map(r => r.emoji === emoji 
                ? { ...r, users: updatedUsers, count: r.count - 1 }
                : r
              )
            };
          }
        }
      }
      return msg;
    }));
    return true;
  };

  const pinMessage = async (messageId) => {
    await mockDelay();
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setChannels(prev => prev.map(ch => {
        if (ch.id === message.channel && !ch.pinnedMessages.includes(messageId)) {
          return { ...ch, pinnedMessages: [...ch.pinnedMessages, messageId] };
        }
        return ch;
      }));
    }
    return true;
  };

  const unpinMessage = async (messageId) => {
    await mockDelay();
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setChannels(prev => prev.map(ch => {
        if (ch.id === message.channel) {
          return { ...ch, pinnedMessages: ch.pinnedMessages.filter(id => id !== messageId) };
        }
        return ch;
      }));
    }
    return true;
  };

  const toggleThreadPanel = (isOpen) => {
    setIsThreadPanelOpen(isOpen !== undefined ? isOpen : !isThreadPanelOpen);
  };

  const getThreadMessages = (threadId) => {
    return messages.filter(msg => msg.threadId === threadId);
  };

  const searchMessages = (query, filters = {}) => {
    let filteredMessages = messages;
    
    if (filters.channelId) {
      filteredMessages = filteredMessages.filter(msg => msg.channel === filters.channelId);
    }
    
    if (filters.senderId) {
      filteredMessages = filteredMessages.filter(msg => msg.user.id === filters.senderId);
    }
    
    if (filters.hasFiles) {
      filteredMessages = filteredMessages.filter(msg => msg.files.length > 0);
    }
    
    if (filters.hasReactions) {
      filteredMessages = filteredMessages.filter(msg => msg.reactions.length > 0);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredMessages = filteredMessages.filter(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filteredMessages;
  };

  const searchFiles = (query) => {
    const allFiles = messages.flatMap(msg => msg.files);
    if (!query) return allFiles;
    
    const lowerQuery = query.toLowerCase();
    return allFiles.filter(file => file.name.toLowerCase().includes(lowerQuery));
  };

  const searchUsers = (query) => {
    if (!query) return mockUsers;
    
    const lowerQuery = query.toLowerCase();
    return mockUsers.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) || 
      user.email.toLowerCase().includes(lowerQuery)
    );
  };

  const uploadFile = async (file, channelId) => {
    await mockDelay();
    // In a real app, this would upload to a storage service
    const newFile = {
      id: `file_${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file), // This creates a temporary URL for demo purposes
      size: file.size,
      type: file.type,
      uploadedBy: currentUser.id,
      uploadedAt: new Date().toISOString()
    };
    
    // Create a message with this file
    const newMessage = {
      id: `msg_${messages.length + 1}`,
      user: currentUser,
      content: `Uploaded file: ${file.name}`,
      timestamp: new Date().toISOString(),
      channel: channelId || activeChannel,
      mentions: [],
      reactions: [],
      files: [newFile],
      edited: false,
      type: 'file_share'
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newFile;
  };

  const deleteFile = async (fileId) => {
    await mockDelay();
    setMessages(prev => prev.map(msg => {
      if (msg.files.some(f => f.id === fileId)) {
        return {
          ...msg,
          files: msg.files.filter(f => f.id !== fileId)
        };
      }
      return msg;
    }));
    return true;
  };

  const getChannelFiles = (channelId) => {
    return messages
      .filter(msg => msg.channel === channelId)
      .flatMap(msg => msg.files);
  };

  const updateNotificationSettings = async (settings) => {
    await mockDelay();
    setNotificationSettings(prev => ({ ...prev, ...settings }));
    return true;
  };

  const markAsRead = (messageId) => {
    setNotifications(prev => prev.map(n => 
      n.messageId === messageId ? { ...n, read: true } : n
    ));
  };

  const getUnreadCount = (channelId) => {
    return notifications.filter(n => n.channelId === channelId && !n.read).length;
  };

  const getChannelMessages = (channelId) => messages.filter(msg => msg.channel === channelId && !msg.threadId);

  const getCurrentUser = () => currentUser;

  const getChannelMembers = (channelId) => {
    const channel = channels.find(ch => ch.id === channelId);
    return channel ? channel.members.map(id => mockUsers.find(u => u.id === id)).filter(Boolean) : [];
  };

  const getUserById = (userId) => mockUsers.find(u => u.id === userId) || null;

  const switchWorkspace = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    // Authentication
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,

    // Workspace
    currentWorkspace,
    workspaces,
    switchWorkspace,

    // Channels
    channels,
    activeChannel,
    setActiveChannel,
    createChannel,
    updateChannel,
    joinChannel,
    leaveChannel,
    archiveChannel,

    // Messages
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    pinMessage,
    unpinMessage,

    // Threading
    activeThread,
    setActiveThread,
    isThreadPanelOpen,
    toggleThreadPanel,
    getThreadMessages,

    // Search
    searchQuery,
    setSearchQuery,
    searchMessages,
    searchFiles,
    searchUsers,

    // Files
    uploadFile,
    deleteFile,
    getChannelFiles,

    // Notifications
    notifications,
    notificationSettings,
    updateNotificationSettings,
    markAsRead,
    getUnreadCount,

    // UI State
    isDarkMode,
    toggleDarkMode,
    showUserProfile,
    setShowUserProfile,
    showChannelInfo,
    setShowChannelInfo,

    // Utility functions
    getChannelMessages,
    getCurrentUser,
    getChannelMembers,
    getUserById
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 