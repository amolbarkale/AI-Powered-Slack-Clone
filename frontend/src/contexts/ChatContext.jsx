import React, { createContext, useContext, useState, useEffect } from 'react';
import { useChannel } from './ChannelContext';
import { useAuth } from './AuthContext';
import { 
  getMessages, 
  getThreadMessages as apiGetThreadMessages, 
  sendMessage as apiSendMessage,
  sendMessageWithAttachment,
  editMessage as apiEditMessage,
  deleteMessage as apiDeleteMessage,
  subscribeToMessages,
  subscribeToThreadMessages,
  getChannelMembers as apiGetChannelMembers
} from '../lib/api';

// Type definitions for documentation purposes
export const User = {
  id: String,
  full_name: String,
  email: String,
  avatar_url: String,
  status: String, // 'available' | 'away' | 'dnd' | 'custom'
  status_text: String,
};

export const Message = {
  id: String,
  user: Object, // User
  content: String,
  created_at: String,
  channel_id: String,
  workspace_id: String,
  parent_message_id: String,
  edited_at: String,
  attachments: Array, // FileAttachment[]
};

export const FileAttachment = {
  id: String,
  filename: String,
  storage_path: String,
  file_type: String,
  file_size: Number,
  uploaded_by: String,
  uploaded_at: String,
  url: String, // Signed URL
};

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { currentChannel } = useChannel();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);

  // Helper function to get messages for a specific channel
  const getChannelMessages = (channelId) => {
    if (!channelId) return [];
    return messages;
  };

  // Helper function to get thread messages
  const getThreadMessages = (threadId) => {
    if (!threadId) return [];
    return threadMessages;
  };

  // Helper function to get channel members
  const getChannelMembers = async (channelId) => {
    if (!channelId) return [];
    
    try {
      const { data, error } = await apiGetChannelMembers(channelId);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting channel members:', err);
      return [];
    }
  };

  // Fetch messages when channel changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChannel || !user) {
        setMessages([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: apiError } = await getMessages(currentChannel.id);
        
        if (apiError) throw apiError;
        
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Subscribe to new messages in this channel
    let subscription;
    if (currentChannel) {
      subscription = subscribeToMessages(currentChannel.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Only add if it's not a thread reply
          if (!payload.new.parent_message_id) {
            setMessages(prev => [...prev, payload.new]);
          } else if (currentThread && payload.new.parent_message_id === currentThread.id) {
            // If it's a reply to the current thread, add it to thread messages
            setThreadMessages(prev => [...prev, payload.new]);
          }
        } else if (payload.eventType === 'UPDATE') {
          // Update in both messages and threadMessages if present
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? payload.new : msg
          ));
          
          setThreadMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? payload.new : msg
          ));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          setThreadMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      });
    }
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentChannel, user]);

  // Subscribe to thread messages when a thread is opened
  useEffect(() => {
    let subscription;
    
    if (currentThread) {
      // Subscribe to thread replies
      subscription = subscribeToThreadMessages(currentThread.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          setThreadMessages(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setThreadMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? payload.new : msg
          ));
        } else if (payload.eventType === 'DELETE') {
          setThreadMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      });
    }
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentThread]);

  const sendMessage = async (content, parentMessageId = null, file = null) => {
    if (!currentChannel || !user) {
      throw new Error('No channel selected or user not authenticated');
    }
    
    try {
      setError(null);
      
      let result;
      
      if (file) {
        setFileUploading(true);
        result = await sendMessageWithAttachment(
          currentChannel.id,
          content,
          file,
          parentMessageId,
          currentChannel.workspace_id
        );
        setFileUploading(false);
      } else {
        result = await apiSendMessage(
          currentChannel.id,
          content,
          parentMessageId,
          currentChannel.workspace_id
        );
      }
      
      if (result.error) throw result.error;
      
      return { data: result.data, error: null };
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      return { data: null, error: err };
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      setError(null);
      
      const { data, error: apiError } = await apiEditMessage(messageId, newContent);
      
      if (apiError) throw apiError;
      
      // Update message in state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent, edited_at: new Date().toISOString() } : msg
      ));
      
      setThreadMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent, edited_at: new Date().toISOString() } : msg
      ));
      
      return { data, error: null };
    } catch (err) {
      console.error('Error editing message:', err);
      setError(err.message);
      return { data: null, error: err };
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setError(null);
      
      const { error: apiError } = await apiDeleteMessage(messageId);
      
      if (apiError) throw apiError;
      
      // Remove message from state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setThreadMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      return { error: null };
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message);
      return { error: err };
    }
  };

  const openThread = async (message) => {
    if (!message) return;
    
    try {
      setLoading(true);
      setError(null);
      setCurrentThread(message);
      setIsThreadOpen(true);
      
      const { data, error: apiError } = await apiGetThreadMessages(message.id);
      
      if (apiError) throw apiError;
      
      setThreadMessages(data || []);
    } catch (err) {
      console.error('Error opening thread:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeThread = () => {
    setIsThreadOpen(false);
    setCurrentThread(null);
    setThreadMessages([]);
  };

  const handleFileUpload = async (file, messageContent = '') => {
    if (!currentChannel || !user) {
      throw new Error('No channel selected or user not authenticated');
    }
    
    try {
      setFileUploading(true);
      setError(null);
      
      const result = await sendMessageWithAttachment(
        currentChannel.id,
        messageContent,
        file,
        null, // Not a thread reply
        currentChannel.workspace_id
      );
      
      if (result.error) throw result.error;
      
      return { data: result.data, error: null };
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setFileUploading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        threadMessages,
        currentThread,
        isThreadOpen,
        loading,
        error,
        fileUploading,
        sendMessage,
        editMessage,
        deleteMessage,
        openThread,
        closeThread,
        handleFileUpload,
        getChannelMessages,
        getThreadMessages,
        getChannelMembers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 